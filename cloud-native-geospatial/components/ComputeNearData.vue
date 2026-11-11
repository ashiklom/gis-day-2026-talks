<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * One looping row of the "Bring the compute to the data" slide.
 * Small blocks travel between Your computer, an S3 bucket in us-west-2 and (mode "near") a tiler
 * in the same region. Travel time stands for latency: slow over the internet, medium within the
 * region, near-instant inside the computer. Timings are illustrative, not measured.
 * Remote on the left, Your computer on the right: positions below are measured from the right
 * edge and mirrored with m() when drawn.
 */
const props = defineProps<{ mode: 'download' | 'remote' | 'near' }>()

const T = 8 // seconds per loop
const INET = 0.9 // one internet hop
const REGION = 0.3 // one hop inside the cloud region
const LOCAL = 0.12 // one hop inside the computer

// x positions (px) inside the 660 px stage, measured from the right edge; m() mirrors them
const W = 660
const m = (x: number) => W - x
const X = { image: 34, gis: 104, copy: 182, boxR: 228, tiler: 482, bucket: 600 }

type Hop = { kind: 'req' | 'data' | 'tile', from: number, to: number, t0: number, dur: number }

const hops = computed<Hop[]>(() => {
  const h: Hop[] = []
  if (props.mode === 'download') {
    h.push({ kind: 'req', from: X.boxR, to: X.bucket, t0: 0, dur: INET })
    for (let i = 0; i < 14; i++) // the whole file, bandwidth-limited
      h.push({ kind: 'data', from: X.bucket, to: X.copy, t0: INET + i * 0.28, dur: INET })
    for (let i = 0; i < 8; i++)
      h.push({ kind: 'data', from: i % 2 ? X.gis : X.copy, to: i % 2 ? X.copy : X.gis, t0: 5.95 + i * LOCAL, dur: LOCAL })
  }
  else if (props.mode === 'remote') {
    h.push({ kind: 'req', from: X.boxR, to: X.bucket, t0: 0, dur: INET })
    h.push({ kind: 'data', from: X.bucket, to: X.copy, t0: INET, dur: INET })
    for (let i = 0; i < 3; i++) {
      h.push({ kind: 'req', from: X.boxR, to: X.bucket, t0: 2 * INET + i * 0.12, dur: INET })
      h.push({ kind: 'data', from: X.bucket, to: X.copy, t0: 3 * INET + i * 0.12, dur: INET })
    }
    for (let i = 0; i < 6; i++)
      h.push({ kind: 'data', from: i % 2 ? X.gis : X.copy, to: i % 2 ? X.copy : X.gis, t0: 4 * INET + 0.4 + i * LOCAL, dur: LOCAL })
  }
  else {
    h.push({ kind: 'req', from: X.boxR, to: X.tiler - 24, t0: 0, dur: INET })
    h.push({ kind: 'req', from: X.tiler + 20, to: X.bucket, t0: INET, dur: REGION })
    h.push({ kind: 'data', from: X.bucket, to: X.tiler + 20, t0: INET + REGION, dur: REGION })
    for (let i = 0; i < 3; i++) {
      h.push({ kind: 'req', from: X.tiler + 20, to: X.bucket, t0: INET + 2 * REGION + i * 0.08, dur: REGION })
      h.push({ kind: 'data', from: X.bucket, to: X.tiler + 20, t0: INET + 3 * REGION + i * 0.08, dur: REGION })
    }
    h.push({ kind: 'tile', from: X.tiler - 24, to: X.gis + 20, t0: INET + 4 * REGION + 0.5, dur: INET })
  }
  return h
})

// when the Image appears, and how the local copy / cache fills
const imageAt = computed(() => props.mode === 'download' ? 7.0 : props.mode === 'remote' ? 4 * INET + 1.2 : 2 * INET + 4 * REGION + 0.6)
const copyFill = computed(() => props.mode === 'download' ? [INET * 2, INET + 13 * 0.28 + INET] : [2 * INET, 4 * INET + 0.3])

const stage = ref<HTMLElement>()
let anims: Animation[] = []

function at(t: number) { return Math.min(Math.max(t / T, 0), 1) }

function start() {
  anims.forEach(a => a.cancel())
  anims = []
  const el = stage.value
  if (!el) return
  el.querySelectorAll<HTMLElement>('.cnd__pkt').forEach((p, i) => {
    const hop = hops.value[i]
    const a = at(hop.t0)
    const b = at(hop.t0 + hop.dur)
    const from = `${m(hop.from)}px`
    const to = `${m(hop.to)}px`
    anims.push(p.animate([
      { offset: 0, left: from, opacity: 0 },
      { offset: a, left: from, opacity: 0 },
      { offset: Math.min(a + 0.002, b), left: from, opacity: 1 },
      { offset: b, left: to, opacity: 1 },
      { offset: Math.min(b + 0.002, 1), left: to, opacity: 0 },
      { offset: 1, left: to, opacity: 0 },
    ], { duration: T * 1000, iterations: Infinity }))
  })
  const img = el.querySelector<HTMLElement>('.cnd__image')
  if (img) {
    anims.push(img.animate([
      { offset: 0, opacity: 0.12 }, { offset: at(imageAt.value), opacity: 0.12 },
      { offset: at(imageAt.value + 0.2), opacity: 1 }, { offset: 0.97, opacity: 1 }, { offset: 1, opacity: 0.12 },
    ], { duration: T * 1000, iterations: Infinity }))
  }
  const fill = el.querySelector<HTMLElement>('.cnd__fill')
  if (fill) {
    const [f0, f1] = copyFill.value
    const full = props.mode === 'download' ? '100%' : '30%'
    anims.push(fill.animate([
      { offset: 0, width: '0%' }, { offset: at(f0), width: '0%' },
      { offset: at(f1), width: full }, { offset: 0.97, width: full }, { offset: 1, width: '0%' },
    ], { duration: T * 1000, iterations: Infinity }))
  }
}

onMounted(start)
watch(() => props.mode, () => requestAnimationFrame(start))
onBeforeUnmount(() => anims.forEach(a => a.cancel()))
</script>

<template>
  <div ref="stage" class="cnd">
    <!-- your computer -->
    <div class="cnd__box box" :style="{ left: `${m(X.boxR)}px`, width: `${X.boxR}px` }">
      <div class="cnd__boxtitle"><GeoIcon name="laptop" :size="1" /> Your computer</div>
    </div>
    <div class="cnd__item cnd__image" :style="{ left: `${m(X.image)}px` }"><GeoIcon name="image" :size="1.7" label="Image" /></div>
    <div class="cnd__item" :style="{ left: `${m(X.gis)}px` }"><GeoIcon name="gis" :size="1.7" label="GIS" /></div>
    <div v-if="mode !== 'near'" class="cnd__item" :style="{ left: `${m(X.copy)}px` }">
      <div class="cnd__copy"><div class="cnd__fill" /></div>
      <div class="cnd__lbl">{{ mode === 'download' ? 'local copy' : 'local cache' }}</div>
    </div>

    <!-- the internet -->
    <div class="cnd__wire" :style="{ left: `${m(mode === 'near' ? X.tiler - 50 : X.bucket - 40)}px`, width: `${(mode === 'near' ? X.tiler - 50 : X.bucket - 40) - X.boxR}px` }">
      <span class="cnd__wirelbl">Internet</span>
    </div>

    <!-- the cloud region -->
    <div class="cnd__region" :class="{ boxed: mode === 'near' }" :style="{ right: `${mode === 'near' ? X.tiler - 52 : X.bucket - 48}px` }">
      <span class="cnd__regionlbl">us-west-2</span>
    </div>
    <div v-if="mode === 'near'" class="cnd__item" :style="{ left: `${m(X.tiler)}px` }"><GeoIcon name="compute" cloud :size="1.7" label="tiler" /></div>
    <div class="cnd__item" :style="{ left: `${m(X.bucket)}px` }"><GeoIcon name="storage" cloud :size="1.7" label="S3 bucket" /></div>

    <!-- moving blocks -->
    <div v-for="(h, i) in hops" :key="`${mode}-${i}`" class="cnd__pkt" :class="h.kind" />
  </div>
</template>

<style scoped>
.cnd { position: relative; width: 660px; height: 92px; }
.cnd__box { position: absolute; top: 0; bottom: 0; padding: 0.2rem 0.4rem; }
.cnd__boxtitle { font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 0.2rem; }
.cnd__item { position: absolute; top: 50px; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; z-index: 1; }
.cnd__copy { width: 48px; height: 22px; border: 1.5px solid var(--box-border); border-radius: 3px; background: var(--bg); overflow: hidden; }
.cnd__fill { height: 100%; width: 0; background: var(--wire); }
.cnd__lbl { font-size: 0.68rem; color: var(--muted); margin-top: 2px; white-space: nowrap; }
.cnd__wire { position: absolute; top: 46px; border-top: 2px dashed currentColor; opacity: 0.5; }
.cnd__wirelbl { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 0.68rem; font-weight: 600; }
.cnd__region { position: absolute; top: 0; bottom: 0; left: 0; border-radius: 10px; }
.cnd__region.boxed { border: 1.5px dashed var(--remote); background: color-mix(in srgb, var(--remote) 6%, var(--bg)); }
.cnd__regionlbl { position: absolute; top: 2px; left: 6px; font-size: 0.68rem; font-weight: 700; color: var(--accent-2); }
.cnd__pkt { position: absolute; top: 40px; width: 11px; height: 11px; margin-left: -5px; opacity: 0; z-index: 2; border-radius: 2px; }
.cnd__pkt.req { width: 8px; height: 8px; margin-left: -4px; top: 32px; border-radius: 999px; background: var(--muted); }
.cnd__pkt.data { background: var(--wire); }
.cnd__pkt.tile { background: var(--wire); width: 13px; height: 13px; outline: 2px solid var(--bg); }
</style>
