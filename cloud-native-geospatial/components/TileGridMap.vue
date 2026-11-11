<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fallbackUrl } from './fallback'
import { OSM_URL, YALE } from './tilemath'

const props = withDefaults(defineProps<{ zoom?: number, height?: string }>(), { zoom: 12, height: '420px' })

const el = ref<HTMLDivElement>()
const showGrid = ref(true)
const offline = ref(false)
let map: L.Map | undefined
let grid: L.GridLayer | undefined
// Slidev mounts slides ahead of time while they're hidden, so Leaflet first measures a 0 × 0 map and
// requests almost no tiles. Re-measure whenever the container's real size changes (e.g. the slide is shown).
let resizer: ResizeObserver | undefined

/** A GridLayer whose "tiles" are just outlined boxes labelled with their own {x, y, z} */
const TileIdLayer = L.GridLayer.extend({
  createTile(coords: L.Coords) {
    const d = document.createElement('div')
    d.className = 'tile-id'
    d.textContent = `{X: ${coords.x}, Y: ${coords.y}, Z: ${coords.z}}`
    return d
  },
})

onMounted(() => {
  map = L.map(el.value!, { keyboard: false, zoomSnap: 1 }).setView([YALE.lat, YALE.lon], props.zoom)
  let loaded = 0
  let errors = 0
  L.tileLayer(OSM_URL, {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  })
    .on('tileload', () => { loaded++ })
    .on('tileerror', () => {
      errors++
      if (errors >= 4 && loaded === 0)
        offline.value = true
    })
    .addTo(map)
  grid = new (TileIdLayer as any)({ tileSize: 256 })
  grid!.addTo(map)
  resizer = new ResizeObserver(() => {
    if (el.value && el.value.clientWidth > 0)
      map?.invalidateSize({ animate: false }) // keeps Yale centred
  })
  resizer.observe(el.value!)
})

watch(showGrid, (on) => {
  if (!map || !grid)
    return
  if (on)
    grid.addTo(map)
  else
    grid.remove()
})

onBeforeUnmount(() => {
  resizer?.disconnect()
  map?.remove()
})
</script>

<template>
  <div class="tgm">
    <div ref="el" class="tgm__map" :style="{ height }" />
    <img v-if="offline" class="tgm__fallback" :src="fallbackUrl('osm-grid.png')">
    <span v-if="offline" class="offline-badge">offline: cached image</span>
    <label class="tgm__toggle">
      <input v-model="showGrid" type="checkbox"> tile IDs
    </label>
  </div>
</template>

<style scoped>
.tgm { position: relative; width: 100%; }
.tgm__map { width: 100%; border-radius: 8px; }
.tgm__fallback { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 900; border-radius: 8px; }
.tgm__toggle {
  position: absolute; top: 10px; right: 10px; z-index: 1000;
  background: white; color: #111; border-radius: 6px; padding: 2px 8px;
  font-size: 0.8rem; box-shadow: 0 1px 4px rgba(0,0,0,0.3); cursor: pointer;
}
:deep(.tile-id) {
  outline: 1px solid var(--wire);
  outline-offset: -1px;
  color: var(--wire);
  font: 700 13px/1 ui-monospace, monospace;
  display: flex; align-items: center; justify-content: center;
  text-shadow: 0 0 3px white, 0 0 3px white;
}
</style>
