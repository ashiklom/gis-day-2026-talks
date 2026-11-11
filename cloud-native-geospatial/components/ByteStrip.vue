<script setup lang="ts">
/**
 * A file as one thin bar, with the byte ranges that were actually fetched marked in --wire.
 * The compact form of RemoteReadDiagram, for places where the whole diagram would be too much
 * (the cover, on top of imagery). Ranges are inclusive byte offsets, as GDAL logs them.
 */
const props = defineProps<{ fileBytes: number, reads: { start: number, end: number }[] }>()
const pos = (r: { start: number, end: number }) => ({
  left: `${100 * r.start / props.fileBytes}%`,
  width: `max(3px, ${100 * (r.end - r.start + 1) / props.fileBytes}%)`,
})
</script>

<template>
  <div class="bs">
    <div class="bs__bar">
      <span v-for="(r, i) in reads" :key="i" class="bs__read" :style="pos(r)" />
    </div>
    <div class="bs__caption"><slot /></div>
  </div>
</template>

<style scoped>
.bs { display: flex; flex-direction: column; gap: 0.4rem; }
.bs__bar {
  position: relative; height: 10px; border-radius: 2px;
  background: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0 6px, rgba(255, 255, 255, 0.14) 6px 7px);
}
.bs__read { position: absolute; top: -3px; bottom: -3px; background: var(--wire); border-radius: 1px; }
.bs__caption { font-size: 0.72rem; }
</style>
