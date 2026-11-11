<script setup lang="ts">
import { computed } from 'vue'
import type { Segment } from './strip'

/**
 * How a remote reader (GDAL, QGIS, a browser) reads a COG.
 * step 0: the file; 1: "open" = GET header; 2: header decoded into a map of the file;
 * 3: read the one full-res tile containing Yale.
 * Overviews are left out here on purpose; they come in on the Overviews slide.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// the real Sentinel-2 TCI COG: 121 full-res 1024² tiles; Yale is tile (7, 2) = index 29
const segments: Segment[] = [
  { id: 'hdr', label: 'header', w: 8, tiles: 0 },
  { id: 'full', label: '10980² full resolution (121 tiles)', w: 92, tiles: 121 },
]

const hot = computed(() => {
  if (props.step === 1 || props.step === 2) return { seg: 'hdr' }
  if (props.step >= 3) return { seg: 'full', tiles: [29] }
  return undefined
})

const requestText = computed(() => {
  if (props.step === 1 || props.step === 2) return 'GET Range: bytes=0-16383'
  if (props.step >= 3) return 'GET Range: bytes=127074304-129335295'
  return ''
})
const requestNote = computed(() => {
  if (props.step === 1 || props.step === 2) return '"open": 16 KB'
  if (props.step >= 3) return '"read Yale at 10 m": 2.3 MB'
  return ''
})
</script>

<template>
  <div class="rra">
    <div class="rra__row">
      <div class="rra__remote">
        <GeoIcon name="storage" cloud :size="1.6" />
        <div class="small-note">TCI.tif (292 MB)</div>
      </div>
      <div class="rra__wire">
        <Transition name="fade" mode="out-in">
          <div v-if="step > 0" :key="requestText" class="rra__req">
            <div class="mono rra__reqtext">{{ requestText }}</div>
            <FlowArrow dashed reverse :width="13">{{ requestNote }}</FlowArrow>
          </div>
        </Transition>
      </div>
      <div class="rra__local">
        <GeoIcon name="laptop" :size="2.6" label="GDAL / QGIS / browser" />
      </div>
    </div>

    <FileStrip :segments="segments" :hot="hot" :max-draw="121" />
    <div class="small-note rra__axis">byte 0 → → → byte 291,914,733 (not to scale)</div>

    <div class="rra__map box reveal" :class="{ concealed: step < 2 }">
        <div class="box-title">What the 16 KB header says</div>
        <div class="mono rra__mapgrid">
          <span>size</span><span>10980 × 10980 px, 3 bands, Byte</span>
          <span>CRS</span><span>WGS 84 / UTM zone 18N, 10 m pixels</span>
          <span>tiles</span><span>1024 × 1024, DEFLATE</span>
          <span>overviews</span><span>5490², 2745², 1373², 687²</span>
          <span>index</span><span>byte offset + length of every tile</span>
        </div>
    </div>
  </div>
</template>

<style scoped>
.rra { display: flex; flex-direction: column; gap: 0.6rem; }
.rra__row { display: flex; align-items: center; justify-content: space-between; min-height: 90px; }
.rra__wire { flex: 1; display: flex; justify-content: center; }
.rra__req { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
.rra__reqtext { font-size: 0.75rem; color: var(--wire); font-weight: 700; }
.rra__req :deep(.flow-arrow__label) { font-size: 0.75rem; margin-bottom: 0.4rem; }
.rra__remote { display: flex; flex-direction: column; align-items: center; }
.rra__axis { text-align: center; margin-top: 0.9rem; }
.rra__map { align-self: flex-start; font-size: 0.75rem; }
.rra__mapgrid { display: grid; grid-template-columns: auto 1fr; gap: 0.1rem 1rem; }
.rra__mapgrid span:nth-child(odd) { color: var(--muted); }
.reveal { transition: opacity 0.3s; }
.reveal.concealed { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
