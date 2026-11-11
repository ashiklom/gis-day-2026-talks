<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Deck } from '@deck.gl/core'
import { COGLayer, COGSource } from '@developmentseed/deck.gl-geotiff'
import { RangeReader } from '@developmentseed/range-reader'
import { fallbackUrl } from './fallback'
import { fmtBytes, S2_TCI_BYTES, S2_TCI_URL } from './cog'
import { YALE } from './tilemath'

// No basemap on purpose: exactly the code shown on the slide (an OSM basemap loaded faster than the COG and flashed first)
withDefaults(defineProps<{ height?: string }>(), { height: '400px' })

const canvas = ref<HTMLCanvasElement>()
const failed = ref(false)
const stats = ref({ requests: 0, bytes: 0 })
let deck: Deck<any> | undefined
let timer: ReturnType<typeof setInterval> | undefined

onMounted(async () => {
  try {
    // our own reader, so we can show how many bytes actually crossed the network
    const reader = new RangeReader()
    timer = setInterval(() => {
      stats.value = { requests: reader.stats.requests, bytes: reader.stats.bytesReceived }
    }, 300)

    const source = await COGSource.open(S2_TCI_URL, { reader })

    const layers: any[] = []
    layers.push(new COGLayer({ id: 'sentinel2', source }))

    deck = new Deck({
      canvas: canvas.value!,
      initialViewState: { longitude: YALE.lon, latitude: YALE.lat, zoom: 11 },
      controller: { keyboard: false },
      layers,
      onError: () => { failed.value = true },
    })
  }
  catch (e) {
    console.error(e)
    failed.value = true
  }
})

onBeforeUnmount(() => {
  clearInterval(timer)
  deck?.finalize()
})
</script>

<template>
  <div class="deck-demo" :style="{ height }">
    <canvas ref="canvas" class="deck-demo__canvas" />
    <img v-if="failed" class="deck-demo__fallback" :src="fallbackUrl('deck-cog.png')">
    <span v-if="failed" class="offline-badge">offline: cached image</span>
    <div class="deck-demo__stats mono">
      {{ stats.requests }} range requests ·
      <b>{{ fmtBytes(stats.bytes) }}</b> of {{ fmtBytes(S2_TCI_BYTES) }}
      ({{ (100 * stats.bytes / S2_TCI_BYTES).toFixed(2) }}%)
    </div>
    <div class="deck-demo__attr">Sentinel-2 L2A (ESA / Copernicus, via AWS Open Data)</div>
  </div>
</template>

<style scoped>
.deck-demo { position: relative; width: 100%; border-radius: 8px; overflow: hidden; background: #ddd; }
.deck-demo__canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.deck-demo__fallback { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.deck-demo__stats {
  position: absolute; left: 8px; top: 8px; font-size: 0.7rem;
  background: rgba(255,255,255,0.9); color: #111; padding: 2px 8px; border-radius: 6px;
}
.deck-demo__attr {
  position: absolute; right: 4px; bottom: 2px; font-size: 0.62rem;
  background: rgba(255,255,255,0.75); color: #333; padding: 0 4px;
}
</style>
