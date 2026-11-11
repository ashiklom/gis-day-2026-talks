<script setup lang="ts">
import { computed } from 'vue'
import type { Segment } from './strip'

/**
 * "Show me the whole scene" from a COG without vs. with overviews.
 * step 1: without overviews -> every full-res tile; step 2: with overviews -> the 4 tiles of the 687² overview.
 * Sizes are from the real TCI.tif tile index (GDAL 3.13.3, 2026-11-11):
 * 121 full-res tiles = 219,981,531 B; 4 tiles of the 687² overview = 819,517 B.
 * Overview tiles are 512², full-res tiles 1024². GDAL writes the smallest overview first.
 * Full-res segments have the same width in both rows (the file without overviews is shorter).
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const without: Segment[] = [
  { id: 'hdr', label: 'header', w: 6, tiles: 0 },
  { id: 'full', label: '10980² full resolution (121 tiles)', w: 62, tiles: 121 },
]
const withOv: Segment[] = [
  { id: 'hdr', label: 'header', w: 6, tiles: 0 },
  { id: 'o4', label: '687² (4)', w: 6, tiles: 4 },
  { id: 'o3', label: '1373² (9)', w: 6, tiles: 9 },
  { id: 'o2', label: '2745² (36)', w: 8, tiles: 36 },
  { id: 'o1', label: '5490² (121)', w: 12, tiles: 121 },
  { id: 'full', label: '10980² full resolution (121)', w: 62, tiles: 121 },
]

const rows = computed(() => [
  {
    title: 'COG without overviews',
    segments: without,
    on: props.step >= 1,
    hot: props.step >= 1 ? { seg: 'full', tiles: 'all' as const } : undefined,
    request: 'GET header + all 121 full-resolution tiles',
    note: '"show me the whole scene": 220 MB',
  },
  {
    title: 'COG with overviews',
    segments: withOv,
    on: props.step >= 2,
    hot: props.step >= 2 ? { seg: 'o4', tiles: 'all' as const } : undefined,
    request: 'GET header + the 4 tiles of the 687² overview',
    note: '"show me the whole scene": 0.8 MB',
  },
])
</script>

<template>
  <div class="ova">
    <div v-for="r in rows" :key="r.title" class="ova__row">
      <div class="ova__top">
        <div class="ova__remote">
          <GeoIcon name="storage" cloud :size="1.4" />
          <div class="small-note"><b>{{ r.title }}</b></div>
        </div>
        <div class="ova__wire">
          <Transition name="fade">
            <div v-if="r.on" class="ova__req">
              <div class="mono ova__reqtext">{{ r.request }}</div>
              <FlowArrow dashed reverse :width="14">{{ r.note }}</FlowArrow>
            </div>
          </Transition>
        </div>
        <GeoIcon name="laptop" :size="1.8" />
      </div>
      <FileStrip :segments="r.segments" :hot="r.hot" :max-draw="121" />
    </div>
  </div>
</template>

<style scoped>
.ova { display: flex; flex-direction: column; gap: 1.6rem; }
.ova__top { display: flex; align-items: center; justify-content: space-between; min-height: 64px; margin-bottom: 0.3rem; }
.ova__wire { flex: 1; display: flex; justify-content: center; }
.ova__req { display: flex; flex-direction: column; align-items: center; }
.ova__reqtext { font-size: 0.72rem; color: var(--hot); font-weight: 700; }
.ova__req :deep(.flow-arrow__label) { font-size: 0.75rem; }
.ova__remote { display: flex; flex-direction: column; align-items: center; min-width: 9rem; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
