<script setup lang="ts">
/**
 * A file drawn as a horizontal strip of segments (header, overviews, full-res tiles).
 * `hot`: which segment lights up, and which of its tiles ('all' or a list of indices).
 * Tiles are drawn as small cells (at most `maxDraw` per segment; not to scale).
 */
import type { Segment } from './strip'

const props = withDefaults(defineProps<{
  segments: Segment[]
  hot?: { seg: string, tiles?: 'all' | number[] }
  maxDraw?: number
}>(), { maxDraw: 48 })

const drawn = (s: Segment) => Math.min(s.tiles, props.maxDraw)
// widths are percentages of the full slide width; a file whose segments sum to < 100 is drawn shorter
const total = () => props.segments.reduce((a, s) => a + s.w, 0)
function tileHot(s: Segment, t: number) {
  if (props.hot?.seg !== s.id || !props.hot.tiles)
    return false
  return props.hot.tiles === 'all' || props.hot.tiles.includes(t)
}
</script>

<template>
  <div class="fs" :style="{ width: `${Math.min(total(), 100)}%` }">
    <div v-for="s in segments" :key="s.id" class="fs__seg"
         :class="{ hot: hot?.seg === s.id && !hot.tiles, meta: (s.kind ?? (s.tiles ? 'data' : 'meta')) === 'meta' }"
         :style="{ width: `${100 * s.w / total()}%` }">
      <div class="fs__tiles">
        <div v-for="t in drawn(s)" :key="t" class="fs__tile" :class="{ hot: tileHot(s, t - 1) }" />
      </div>
      <div class="fs__label">{{ s.label }}</div>
    </div>
  </div>
</template>

<style scoped>
.fs { display: flex; height: 54px; border: 1px solid var(--box-border); border-radius: 4px; }
.fs__seg { position: relative; border-right: 2px solid var(--box-border); background: var(--box-bg); transition: background 0.3s; }
.fs__seg.meta { background: color-mix(in srgb, var(--meta) 28%, var(--bg)); }
.fs__seg.hot { background: var(--wire); }
.fs__tiles { display: grid; grid-template-rows: repeat(3, 1fr); grid-auto-flow: column; grid-auto-columns: 1fr; gap: 1px; padding: 3px; height: 100%; }
.fs__tile { background: var(--tile); border-radius: 1px; transition: background 0.3s; }
.fs__tile.hot { background: var(--wire); box-shadow: 0 0 0 1px var(--wire); }
.fs__label { position: absolute; top: calc(100% + 3px); left: 3px; font-size: 0.68rem; white-space: nowrap; color: var(--muted); }
</style>
