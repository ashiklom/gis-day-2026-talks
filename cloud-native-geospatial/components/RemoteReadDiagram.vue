<script setup lang="ts">
import { computed } from 'vue'
import { fmtBytes } from './cog'

type Read = { start: number, end: number, label?: string }
const props = withDefaults(defineProps<{
  fileBytes: number
  reads: Read[]
  fileName?: string
  tool?: string
}>(), { fileName: 'TCI.tif', tool: 'gdalinfo' })

const total = computed(() => props.reads.reduce((a, r) => a + (r.end - r.start + 1), 0))
const pct = computed(() => 100 * total.value / props.fileBytes)
</script>

<template>
  <div class="rrd">
    <div class="rrd__remote">
      <GeoIcon name="storage" cloud :size="2" />
      <div class="rrd__file">
        <div class="rrd__filelabel">{{ fileName }} · {{ fmtBytes(fileBytes) }} on AWS S3 (Oregon)</div>
        <div class="rrd__bar">
          <div v-for="(r, i) in reads" :key="i" class="rrd__read"
               :style="{ left: `${100 * r.start / fileBytes}%`, width: `max(3px, ${100 * (r.end - r.start + 1) / fileBytes}%)` }">
            <span class="rrd__readlabel mono">{{ r.label ?? fmtBytes(r.end - r.start + 1) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="rrd__wire">
      <FlowArrow dashed :width="10">
        <b>{{ fmtBytes(total) }}</b> crosses the internet ({{ pct < 0.1 ? pct.toFixed(4) : pct.toFixed(1) }}% of the file)
      </FlowArrow>
    </div>
    <div class="rrd__local">
      <GeoIcon name="laptop" :size="2.2" :label="tool" />
    </div>
  </div>
</template>

<style scoped>
.rrd { display: flex; align-items: center; gap: 0.8rem; justify-content: center; }
.rrd__remote { display: flex; align-items: center; gap: 0.6rem; }
.rrd__file { width: 360px; }
.rrd__filelabel { font-size: 0.72rem; margin-bottom: 0.2rem; color: var(--muted); }
.rrd__bar {
  position: relative; height: 26px; border-radius: 4px;
  background: repeating-linear-gradient(90deg, var(--surface) 0 8px, color-mix(in srgb, var(--line) 45%, transparent) 8px 9px);
  border: 1px solid var(--box-border);
}
.rrd__read { position: absolute; top: -3px; bottom: -3px; background: var(--wire); border-radius: 2px; }
.rrd__readlabel { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); font-size: 0.72rem; color: var(--wire); white-space: nowrap; font-weight: 700; }
.rrd__wire { font-size: 0.8rem; }
.rrd__wire :deep(.flow-arrow__label) { font-style: normal; font-size: 0.72rem; }
</style>
