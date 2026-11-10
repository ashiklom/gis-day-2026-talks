<script setup lang="ts">
import { computed } from 'vue'

/**
 * How a remote reader (GDAL, QGIS, a browser) reads a COG.
 * step 0: the file; 1: "open" = GET header; 2: header decoded into a map of the file;
 * 3: read one full-res tile; 4: read one tile of a coarse overview instead
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// layout of the real Sentinel-2 TCI COG (GDAL writes smallest overview first, full res last)
const segments = [
  { id: 'hdr', label: 'header', w: 8, tiles: 0 },
  { id: 'o4', label: '687²', w: 5, tiles: 1 },
  { id: 'o3', label: '1373²', w: 6, tiles: 4 },
  { id: 'o2', label: '2745²', w: 10, tiles: 9 },
  { id: 'o1', label: '5490²', w: 21, tiles: 36 },
  { id: 'full', label: '10980² (full resolution)', w: 50, tiles: 121 },
]

const hot = computed(() => {
  if (props.step === 1 || props.step === 2) return { seg: 'hdr', tile: -1 }
  if (props.step === 3) return { seg: 'full', tile: 20 }
  if (props.step >= 4) return { seg: 'o4', tile: 0 }
  return { seg: '', tile: -1 }
})

const requestText = computed(() => {
  if (props.step === 1 || props.step === 2) return 'GET Range: bytes=0-16383'
  if (props.step === 3) return 'GET Range: bytes=127074304-129335295'
  if (props.step >= 4) return 'GET Range: one tile of the 687² overview'
  return ''
})
const requestNote = computed(() => {
  if (props.step === 1 || props.step === 2) return '"open": 16 KB'
  if (props.step === 3) return '"read Yale at 10 m": 2.3 MB'
  if (props.step >= 4) return '"show me the whole scene": ~1 tile'
  return ''
})
</script>

<template>
  <div class="rra">
    <div class="rra__row">
      <div class="rra__local">
        <GeoIcon name="laptop" :size="2.6" label="GDAL / QGIS / browser" />
      </div>
      <div class="rra__wire">
        <Transition name="fade" mode="out-in">
          <div v-if="step > 0" :key="step" class="rra__req">
            <div class="mono rra__reqtext">{{ requestText }}</div>
            <FlowArrow dashed :width="13">{{ requestNote }}</FlowArrow>
          </div>
        </Transition>
      </div>
      <div class="rra__remote">
        <GeoIcon name="storage" cloud :size="1.6" />
        <div class="mono small-note">TCI.tif (292 MB)</div>
      </div>
    </div>

    <div class="rra__strip">
      <div v-for="s in segments" :key="s.id" class="rra__seg"
           :class="{ hot: hot.seg === s.id && hot.tile < 0, hdr: s.id === 'hdr' }"
           :style="{ width: `${s.w}%` }">
        <div class="rra__tiles">
          <div v-for="t in Math.min(s.tiles, 40)" :key="t" class="rra__tile"
               :class="{ hot: hot.seg === s.id && (t - 1) === Math.min(hot.tile, 39) }" />
        </div>
        <div class="rra__seglabel">{{ s.label }}</div>
      </div>
    </div>
    <div class="small-note rra__axis">byte 0 → → → byte 291,914,733 (not to scale)</div>

    <Transition name="fade">
      <div v-if="step >= 2" class="rra__map box">
        <div class="box-title">What the 16 KB header says</div>
        <div class="mono rra__mapgrid">
          <span>size</span><span>10980 × 10980 px, 3 bands, Byte</span>
          <span>CRS</span><span>WGS 84 / UTM zone 18N, 10 m pixels</span>
          <span>tiles</span><span>1024 × 1024, DEFLATE</span>
          <span>overviews</span><span>5490², 2745², 1373², 687²</span>
          <span>index</span><span>byte offset + length of all 171 tiles</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.rra { display: flex; flex-direction: column; gap: 0.6rem; }
.rra__row { display: flex; align-items: center; justify-content: space-between; min-height: 90px; }
.rra__wire { flex: 1; display: flex; justify-content: center; }
.rra__req { display: flex; flex-direction: column; align-items: center; }
.rra__reqtext { font-size: 0.75rem; color: var(--hot); font-weight: 700; }
.rra__req :deep(.flow-arrow__label) { font-size: 0.75rem; }
.rra__remote { display: flex; flex-direction: column; align-items: center; }
.rra__strip { display: flex; height: 54px; border: 1px solid var(--box-border); border-radius: 4px; }
.rra__seg { position: relative; border-right: 2px solid var(--box-border); background: var(--box-bg); transition: background 0.3s; }
.rra__seg.hdr { background: rgba(124, 58, 237, 0.15); }
.rra__seg.hot { background: var(--hot); }
.rra__tiles { display: flex; flex-wrap: wrap; gap: 1px; padding: 3px; height: 34px; overflow: hidden; align-content: flex-start; }
.rra__tile { flex: 1 0 6px; height: 13px; background: rgba(40,109,192,0.3); border-radius: 1px; transition: background 0.3s; }
.rra__tile.hot { background: var(--hot); box-shadow: 0 0 0 2px var(--hot); }
.rra__seglabel { position: absolute; top: calc(100% + 3px); left: 3px; font-size: 0.55rem; white-space: nowrap; color: var(--muted); }
.rra__axis { text-align: center; margin-top: 0.9rem; }
.rra__map { align-self: flex-start; font-size: 0.75rem; }
.rra__mapgrid { display: grid; grid-template-columns: auto 1fr; gap: 0.1rem 1rem; }
.rra__mapgrid span:nth-child(odd) { color: var(--muted); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
