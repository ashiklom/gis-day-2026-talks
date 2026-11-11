<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fallbackUrl, loadImage } from './fallback'

/** NASA GIBS WMS 1.3.0 (EPSG:4326 => BBOX is lat,lon order) */
const ENDPOINT = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi'

const PRESETS: Record<string, [number, number, number, number]> = {
  'Greater New Haven': [-73.05, 41.22, -72.80, 41.40],
  'Downtown + Yale': [-72.96, 41.29, -72.90, 41.33],
  'Harbor + Long Island Sound': [-72.97, 41.20, -72.85, 41.30],
  'East Rock + Hamden': [-72.95, 41.31, -72.86, 41.39],
}

const VARIABLES = [
  { id: 'HLS_S30_Nadir_BRDF_Adjusted_Reflectance', label: 'True color: HLS Sentinel-2 (30 m)', cmap: 'RGB composite' },
  { id: 'HLS_L30_Nadir_BRDF_Adjusted_Reflectance', label: 'True color: HLS Landsat (30 m)', cmap: 'RGB composite' },
  { id: 'OPERA_L3_Dynamic_Surface_Water_Extent-HLS', label: 'Surface water: OPERA DSWx (30 m)', cmap: 'water classes' },
  { id: 'MODIS_Terra_L3_NDVI_16Day', label: 'NDVI: MODIS 16-day (250 m)', cmap: 'brown → green' },
  { id: 'MODIS_Terra_L3_Land_Surface_Temp_8Day_Day', label: 'Land surface temp: MODIS 8-day (1 km)', cmap: 'blue → red' },
]

const DEFAULT = { preset: 'Greater New Haven', time: '2025-08-04', variable: VARIABLES[0].id }
const FALLBACK = fallbackUrl('gibs-default.png')

const preset = ref(DEFAULT.preset)
const bbox = ref<[number, number, number, number]>([...PRESETS[DEFAULT.preset]])
const time = ref(DEFAULT.time)
const variable = ref(DEFAULT.variable)

function applyPreset() {
  bbox.value = [...PRESETS[preset.value]]
}

const WIDTH = 640
const height = computed(() => {
  const [w, s, e, n] = bbox.value
  const midLat = ((s + n) / 2) * Math.PI / 180
  return Math.max(64, Math.round(WIDTH * (n - s) / ((e - w) * Math.cos(midLat))))
})

// one key per line, arrays inline
const requestText = computed(() => [
  `{ "bbox": [${bbox.value.map(v => (+v).toFixed(2)).join(', ')}],`,
  `  "time": "${time.value}",`,
  `  "variable": "${variable.value}",`,
  `  "colormap": "(fixed by server)" }`,
].join('\n'))

const url = computed(() => {
  const [w, s, e, n] = bbox.value
  const q = new URLSearchParams({
    SERVICE: 'WMS',
    REQUEST: 'GetMap',
    VERSION: '1.3.0',
    LAYERS: variable.value,
    STYLES: '',
    CRS: 'EPSG:4326',
    BBOX: [s, w, n, e].join(','),
    WIDTH: String(WIDTH),
    HEIGHT: String(height.value),
    FORMAT: 'image/png',
    TIME: time.value,
  })
  return `${ENDPOINT}?${q.toString()}`
})

const applied = ref('')
const loading = ref(false)
const shown = ref<{ src: string, offline: boolean } | null>(null)
const elapsed = ref<number | null>(null)
const dirty = computed(() => url.value !== applied.value)

async function update() {
  if (!dirty.value || loading.value)
    return
  const target = url.value
  const isDefault = preset.value === DEFAULT.preset && time.value === DEFAULT.time
    && variable.value === DEFAULT.variable
    && bbox.value.join() === PRESETS[DEFAULT.preset].join()
  loading.value = true
  const t0 = performance.now()
  shown.value = await loadImage(target, isDefault ? FALLBACK : undefined, 25000)
  elapsed.value = (performance.now() - t0) / 1000
  applied.value = target
  loading.value = false
}

const currentCmap = computed(() => VARIABLES.find(v => v.id === variable.value)?.cmap)

onMounted(update)
</script>

<template>
  <div class="maps-demo">
    <div class="controls">
      <label>Area
        <select v-model="preset" @change="applyPreset">
          <option v-for="(_, k) in PRESETS" :key="k" :value="k">{{ k }}</option>
        </select>
      </label>
      <div class="bbox">
        <label v-for="(name, i) in ['W', 'S', 'E', 'N']" :key="name">{{ name }}
          <input v-model.number="bbox[i]" type="number" step="0.01">
        </label>
      </div>
      <label>Time
        <input v-model="time" type="date">
      </label>
      <label>Variable
        <select v-model="variable">
          <option v-for="v in VARIABLES" :key="v.id" :value="v.id">{{ v.label }}</option>
        </select>
      </label>
      <label class="disabled" title="GIBS pre-renders each layer with one fixed style">Color map
        <select disabled><option>{{ currentCmap }} (fixed by server)</option></select>
      </label>
      <button class="update" :disabled="!dirty || loading" @click="update">
        {{ loading ? 'Rendering…' : 'Update' }}
      </button>
      <div class="req">
        <div class="box-title">Request</div>
        <pre class="json">{{ requestText }}</pre>
        <div class="url mono">{{ url }}</div>
      </div>
    </div>
    <div class="result">
      <div v-if="shown" class="imgwrap">
        <span v-if="shown.offline" class="offline-badge">offline: cached image</span>
        <img :src="shown.src" :class="{ stale: loading }">
      </div>
      <div v-else class="placeholder">Requesting map…</div>
      <div class="small-note">
        NASA GIBS WMS · {{ elapsed ? `${elapsed.toFixed(1)} s round trip` : '' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.maps-demo {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.2rem;
  font-size: 0.72rem;
  margin-top: -0.6rem;
}
.controls { display: flex; flex-direction: column; gap: 0.3rem; }
.controls label { display: flex; flex-direction: column; gap: 0.1rem; font-weight: 600; }
.controls select, .controls input {
  font-weight: 400;
  border: 1px solid var(--box-border);
  border-radius: 6px;
  padding: 2px 6px;
  background: var(--bg);
}
.bbox { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.3rem; }
.bbox input { width: 100%; }
.disabled { opacity: 0.55; }
.update {
  margin-top: 0.2rem;
  background: var(--yale);
  color: white;
  border: 1.5px solid var(--yale);
  border-radius: 6px;
  padding: 4px 0;
  font-weight: 600;
}
/* nothing to update yet: quiet outline, not a grey slab that reads as broken */
.update:disabled { background: transparent; color: var(--muted); border-color: var(--line); cursor: default; }
.req { margin-top: 0.2rem; }
.json {
  font-size: 0.62rem;
  line-height: 1.25;
  margin: 0;
  padding: 0.3rem 0.5rem;
  background: var(--box-bg);
  border-radius: 6px;
  white-space: pre;
  overflow: hidden;
}
.url {
  margin-top: 0.25rem;
  font-size: 0.58rem;
  line-height: 1.25;
  word-break: break-all;
  color: var(--muted);
}
.result { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.imgwrap { position: relative; }
.imgwrap img { max-height: 390px; max-width: 100%; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); transition: opacity 0.3s; }
.imgwrap img.stale { opacity: 0.4; }
.placeholder { color: var(--muted); }
</style>
