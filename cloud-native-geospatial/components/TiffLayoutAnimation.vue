<script setup lang="ts">
import { computed } from 'vue'

/**
 * Round trips needed to read a small window from a regular GeoTIFF vs. a COG.
 * Steps 1–4 walk the regular file; steps 5–6 walk the COG (the COG row stays hidden until step 5).
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

type Seg = { label: string, w: number, kind: 'meta' | 'data' | 'ovr', parts?: number }
type Trip = { seg: number, part?: number, text: string }

const regular: { segs: Seg[], trips: Trip[] } = {
  segs: [
    { label: 'hdr', w: 3, kind: 'meta' },
    { label: 'pixel data: full-width strips, no overviews', w: 77, kind: 'data', parts: 16 },
    { label: 'IFD', w: 6, kind: 'meta' },
    { label: 'strip offsets', w: 14, kind: 'meta' },
  ],
  trips: [
    { seg: 0, text: 'header → "IFD is at the end"' },
    { seg: 2, text: 'IFD → "offsets are over there"' },
    { seg: 3, text: 'offset table → where the strips are' },
    { seg: 1, part: 9, text: 'whole-width strips, much more than you need' },
  ],
}
const cog: { segs: Seg[], trips: Trip[] } = {
  segs: [
    { label: 'hdr + all IFDs + offsets', w: 17, kind: 'meta' },
    { label: 'overviews', w: 19, kind: 'ovr', parts: 5 },
    { label: 'full-res tiles', w: 64, kind: 'data', parts: 24 },
  ],
  trips: [
    { seg: 0, text: 'one read: everything about the file' },
    { seg: 2, part: 13, text: 'exactly the tile you need' },
  ],
}

const regTrips = computed(() => Math.min(Math.max(props.step, 0), regular.trips.length))
const cogTrips = computed(() => Math.min(Math.max(props.step - regular.trips.length, 0), cog.trips.length))

const rows = computed(() => [
  { title: 'Regular GeoTIFF', ...regular, shown: regTrips.value },
  { title: 'Cloud-Optimized GeoTIFF', ...cog, shown: cogTrips.value, hidden: props.step <= regular.trips.length },
])
</script>

<template>
  <div class="tla">
    <div v-for="row in rows" :key="row.title" class="tla__row reveal" :class="{ concealed: row.hidden }">
      <div class="tla__head">
        <b>{{ row.title }}</b>
        <span class="tla__count" :class="{ on: row.shown > 0 }">
          {{ row.shown }} round trip{{ row.shown === 1 ? '' : 's' }}
          <template v-if="row.shown > 0 && row.shown === row.trips.length"> → pixels!</template>
        </span>
      </div>
      <div class="tla__strip">
        <div v-for="(s, i) in row.segs" :key="i" class="tla__seg" :class="[s.kind]" :style="{ width: `${s.w}%` }">
          <div v-if="s.parts" class="tla__parts">
            <div v-for="p in s.parts" :key="p" class="tla__part"
                 :class="{ hot: row.trips.slice(0, row.shown).some(t => t.seg === i && t.part !== undefined && (s.kind === 'data' && row.title.startsWith('Regular') ? Math.abs(p - 1 - t.part!) <= 1 : p - 1 === t.part)) }" />
          </div>
          <span class="tla__seglabel">{{ s.label }}</span>
          <div v-for="(t, k) in row.trips.slice(0, row.shown)" :key="k">
            <div v-if="t.seg === i" class="tla__trip"
                 :style="{ left: t.part !== undefined ? `${100 * (t.part + 0.5) / s.parts!}%` : '50%' }">
              <span class="tla__num">{{ k + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
      <ol class="tla__legend">
        <li v-for="(t, k) in row.trips.slice(0, row.shown)" :key="k"><span class="tla__num">{{ k + 1 }}</span>{{ t.text }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.tla { display: flex; flex-direction: column; gap: 1.1rem; font-size: 0.8rem; }
.tla__head { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
.tla__count { color: var(--muted); }
.tla__count.on { color: var(--ink); font-weight: 700; }
.tla__strip { margin-top: 16px; display: flex; height: 44px; border: 1px solid var(--box-border); border-radius: 4px; }
.tla__seg { position: relative; border-right: 2px solid var(--box-border); }
.tla__seg.meta { background: color-mix(in srgb, var(--meta) 28%, var(--bg)); }
.tla__seg.data { background: var(--box-bg); }
.tla__seg.ovr { background: color-mix(in srgb, var(--overview) 20%, var(--bg)); }
.tla__parts { display: flex; height: 100%; }
.tla__part { flex: 1; border-right: 1px solid color-mix(in srgb, var(--line) 60%, transparent); transition: background 0.3s; }
.tla__part.hot { background: var(--wire); }
.tla__seglabel { position: absolute; bottom: -1.15rem; left: 2px; font-size: 0.68rem; color: var(--muted); white-space: nowrap; }
.tla__trip { position: absolute; top: -12px; transform: translateX(-50%); }
.tla__num {
  display: inline-flex; width: 20px; height: 20px; border-radius: 999px; align-items: center; justify-content: center;
  background: var(--wire); color: white; font-weight: 700; font-size: 0.7rem; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.tla__legend { margin: 1.4rem 0 0; padding: 0; list-style: none; font-size: 0.8rem; line-height: 1.35; display: flex; flex-direction: column; gap: 0.3rem; }
.tla__legend li { margin: 0; display: flex; align-items: center; gap: 0.5rem; }
.tla__legend .tla__num { flex-shrink: 0; box-shadow: none; }
</style>
