<script setup lang="ts">
import { computed } from 'vue'

/** step 0: template; 1: zoom picked; 2: x/y picked; 3: pan right one tile; 4: zoom in */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const state = computed(() => {
  const s = props.step
  if (s <= 0) return { z: '{z}', x: '{x}', y: '{y}', note: 'The client fills in the blanks…' }
  if (s === 1) return { z: '12', x: '{x}', y: '{y}', note: 'zoom level → z' }
  if (s === 2) return { z: '12', x: '1218', y: '1530', note: 'map position → x, y (Yale)' }
  if (s === 3) return { z: '12', x: '1219', y: '1530', note: 'pan east one tile → x + 1' }
  return { z: '13', x: '2436', y: '3061', note: 'zoom in → z + 1, and x, y roughly double' }
})
</script>

<template>
  <div class="tut">
    <div class="mono tut__url">
      https://tile.openstreetmap.org/<span class="z">{{ state.z }}</span>/<span class="x">{{ state.x }}</span>/<span class="y">{{ state.y }}</span>.png
    </div>
    <div class="tut__note">{{ state.note }}</div>
  </div>
</template>

<style scoped>
.tut { text-align: center; }
.tut__url { font-size: 1.25rem; font-weight: 600; padding: 0.5rem 1rem; background: var(--box-bg); border-radius: 8px; display: inline-block; }
.tut__note { margin-top: 0.4rem; color: var(--muted); font-style: italic; }
.z { color: #7c3aed; }
.x { color: var(--hot); }
.y { color: #0891b2; }
</style>
