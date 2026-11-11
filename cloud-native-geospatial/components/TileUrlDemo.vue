<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fallbackUrl } from './fallback'
import { lonLatToTile, osmTileUrl, YALE } from './tilemath'

const PLACES: Record<string, { lat: number, lon: number, z: number }> = {
  'Yale (Old Campus)': { ...YALE, z: 12 },
  'Lighthouse Point': { lat: 41.2489, lon: -72.9037, z: 15 },
  'Connecticut': { lat: 41.6, lon: -72.7, z: 7 },
  'The whole world': { lat: 0, lon: 0, z: 0 },
}

const place = ref('Yale (Old Campus)')
const lat = ref(PLACES[place.value].lat)
const lon = ref(PLACES[place.value].lon)
const z = ref(PLACES[place.value].z)
function applyPlace() {
  const p = PLACES[place.value]
  lat.value = p.lat
  lon.value = p.lon
  z.value = p.z
}

const tile = computed(() => lonLatToTile(+lon.value, +lat.value, +z.value))
const url = computed(() => osmTileUrl(tile.value.z, tile.value.x, tile.value.y))

// 3x3 neighbourhood; centre tile is the one the URL points to
const neighbours = computed(() => {
  const n = 2 ** tile.value.z
  const out: { dx: number, dy: number, src: string | null }[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = tile.value.x + dx
      const y = tile.value.y + dy
      const ok = y >= 0 && y < n
      const xw = ((x % n) + n) % n
      out.push({ dx, dy, src: ok ? osmTileUrl(tile.value.z, xw, y) : null })
    }
  }
  return out
})

const offline = ref(false)
watch(url, () => { offline.value = false })
</script>

<template>
  <div class="tile-demo">
    <div class="controls">
      <label>Place
        <select v-model="place" @change="applyPlace">
          <option v-for="(_, k) in PLACES" :key="k" :value="k">{{ k }}</option>
        </select>
      </label>
      <div class="row">
        <label>Latitude <input v-model.number="lat" type="number" step="0.001"></label>
        <label>Longitude <input v-model.number="lon" type="number" step="0.001"></label>
      </div>
      <label>Zoom: {{ z }}
        <input v-model.number="z" type="range" min="0" max="19">
      </label>
      <div class="ids mono">
        <span class="z">z = {{ tile.z }}</span>
        <span class="x">x = {{ tile.x }}</span>
        <span class="y">y = {{ tile.y }}</span>
      </div>
      <div class="small-note">{{ ((2 ** tile.z) ** 2).toLocaleString() }} tiles at this zoom ({{ 2 ** tile.z }} × {{ 2 ** tile.z }})</div>
      <div class="url-box">
        <div class="box-title">Tile URL</div>
        <div class="mono url">
          https://tile.openstreetmap.org/<br><span class="z">{{ tile.z }}</span>/<span class="x">{{ tile.x }}</span>/<span class="y">{{ tile.y }}</span>.png
        </div>
      </div>
    </div>
    <div class="result">
      <div class="grid">
        <div v-for="t in neighbours" :key="`${t.dx},${t.dy}`" class="cell" :class="{ centre: t.dx === 0 && t.dy === 0 }">
          <template v-if="t.dx === 0 && t.dy === 0">
            <img v-if="!offline" :src="t.src!" @error="offline = true">
            <img v-else :src="fallbackUrl('osm-tile.png')">
            <span v-if="offline" class="offline-badge">offline</span>
            <div class="pin" :style="{ left: `${tile.fx * 100}%`, top: `${tile.fy * 100}%` }" />
          </template>
          <img v-else-if="t.src && !offline" :src="t.src">
        </div>
      </div>
      <div class="small-note">© OpenStreetMap contributors</div>
    </div>
  </div>
</template>

<style scoped>
.tile-demo { display: grid; grid-template-columns: 330px 1fr; gap: 1.5rem; font-size: 0.85rem; }
.controls { display: flex; flex-direction: column; gap: 0.6rem; }
.controls label { display: flex; flex-direction: column; font-weight: 600; gap: 0.1rem; }
.controls input[type=number], .controls select {
  font-weight: 400; border: 1px solid var(--box-border); border-radius: 6px; padding: 2px 6px; background: var(--bg);
}
.row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.row input { width: 100%; }
.ids { display: flex; gap: 1rem; font-size: 1.1rem; font-weight: 700; }
.z { color: #7c3aed; }
.x { color: #c2410c; }
.y { color: #0e7490; }
.url { font-size: 0.8rem; word-break: break-all; font-weight: 600; }
.url-box { background: var(--box-bg); border-radius: 8px; padding: 0.5rem 0.7rem; }
.result { display: flex; flex-direction: column; align-items: center; }
.grid { display: grid; grid-template-columns: repeat(3, 128px); grid-template-rows: repeat(3, 128px); gap: 2px; }
.cell { position: relative; background: var(--surface); overflow: visible; }
.cell img { width: 100%; height: 100%; display: block; opacity: 0.35; }
.cell.centre { z-index: 1; transform: scale(1.5); box-shadow: 0 0 0 2px var(--wire), 0 6px 18px rgba(0,0,0,0.35); }
.cell.centre img { opacity: 1; }
.pin {
  position: absolute; width: 10px; height: 10px; margin: -5px 0 0 -5px;
  border-radius: 999px; background: var(--yale); border: 2px solid white;
}
</style>
