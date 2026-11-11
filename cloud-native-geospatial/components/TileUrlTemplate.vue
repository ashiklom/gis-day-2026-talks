<script setup lang="ts">
/**
 * Three tile URLs, one per click step, each with its annotation on the left.
 * 11/609/765 covers New Haven, East Haven and Branford; its child 12/1218/1531
 * covers downtown New Haven and Yale's Old Campus.
 */
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const rows = [
  { note: 'zoom level (z) and map position x, y', z: '{z}', x: '{x}', y: '{y}' },
  { note: 'New Haven, East Haven, and Branford', z: '11', x: '609', y: '765' },
  { note: 'Zoom in on New Haven: x, y roughly double', z: '12', x: '1218', y: '1531' },
]
</script>

<template>
  <div class="tut">
    <template v-for="(r, i) in rows" :key="i">
      <div class="tut__note reveal" :class="{ concealed: step < i + 1 }">{{ r.note }}</div>
      <div class="mono tut__url reveal" :class="{ concealed: step < i + 1 }">
        https://tile.openstreetmap.org/<span class="z">{{ r.z }}</span>/<span class="x">{{ r.x }}</span>/<span class="y">{{ r.y }}</span>.png
      </div>
    </template>
  </div>
</template>

<style scoped>
.tut { display: grid; grid-template-columns: auto auto; justify-content: center; align-items: center; gap: 0.6rem 1.2rem; }
.tut__note { text-align: right; color: var(--muted); font-style: italic; font-size: 0.95rem; }
.tut__url { font-size: 1.1rem; font-weight: 600; padding: 0.3rem 0.8rem; background: var(--box-bg); border-radius: 8px; }
.z { color: #7c3aed; }
.x { color: var(--hot); }
.y { color: #0891b2; }
.reveal { transition: opacity 0.3s; }
.reveal.concealed { opacity: 0; }
</style>
