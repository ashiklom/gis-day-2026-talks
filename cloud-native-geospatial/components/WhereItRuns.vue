<script setup lang="ts">
import type { IconName } from './icons'

/**
 * The geographer's toolbox: Your computer (GIS + Web browser) linked to an Internet hub
 * with four equal, mirror-symmetric spokes.
 * step: 0 nothing, 1 empty computer box, 2 + GIS / browser, 3 + network. Omit to show all.
 */
const props = defineProps<{ step?: number }>()
const at = (n: number) => props.step === undefined || props.step >= n

type Node = { id: string, dx: number, dy: number, icon: IconName, label: string, cloud?: boolean }
const W = 720
const H = 250
const hub = { x: 505, y: 125, r: 46 }
const SPOKE_X = 128
const SPOKE_Y = 82
const nodes: Node[] = [
  { id: 'server', dx: -SPOKE_X, dy: -SPOKE_Y, icon: 'server', label: 'Institutional server' },
  { id: 'ftp', dx: -SPOKE_X, dy: SPOKE_Y, icon: 'storage', label: 'FTP / remote storage' },
  { id: 'ccompute', dx: SPOKE_X, dy: -SPOKE_Y, icon: 'server', label: 'Cloud compute', cloud: true },
  { id: 'cstorage', dx: SPOKE_X, dy: SPOKE_Y, icon: 'storage', label: 'Cloud storage', cloud: true },
]
const boxRight = 225
</script>

<template>
  <div class="where" :style="{ width: `${W}px`, height: `${H}px` }">
    <svg :width="W" :height="H" class="where__lines reveal" :class="{ hidden: !at(3) }">
      <line v-for="n in nodes" :key="n.id" :x1="hub.x" :y1="hub.y" :x2="hub.x + n.dx" :y2="hub.y + n.dy"
            stroke="currentColor" stroke-width="2" opacity="0.5" />
      <line :x1="boxRight" :y1="hub.y" :x2="hub.x - hub.r" :y2="hub.y"
            stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 6" opacity="0.8" />
    </svg>

    <div class="where__computer reveal" :class="{ hidden: !at(1) }" :style="{ top: `${hub.y}px`, width: `${boxRight}px` }">
      <LocalComputerBox :show-tools="at(2)" :size="2.2" />
    </div>

    <div class="where__hub reveal" :class="{ hidden: !at(3) }"
         :style="{ left: `${hub.x}px`, top: `${hub.y}px`, width: `${2 * hub.r}px`, height: `${2 * hub.r}px` }">
      <GeoIcon name="internet" :size="1.9" />
      <div class="where__hub-label">Internet</div>
    </div>
    <div v-for="n in nodes" :key="n.id" class="where__node reveal" :class="{ hidden: !at(3) }"
         :style="{ left: `${hub.x + n.dx}px`, top: `${hub.y + n.dy}px` }">
      <GeoIcon :name="n.icon" :cloud="n.cloud" :size="2.1" :label="n.label" />
    </div>
  </div>
</template>

<style scoped>
.where { position: relative; margin: 0 auto; }
.where__lines { position: absolute; inset: 0; }
.where__computer { position: absolute; left: 0; transform: translateY(-50%); display: flex; }
.where__computer > * { width: 100%; }
.where__node {
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--bg);
  padding: 4px;
  border-radius: 8px;
}
.where__hub {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem;
  background: var(--bg);
  border: 2px solid var(--box-border);
  border-radius: 999px;
}
.where__hub-label { font-weight: 600; font-size: 0.8rem; letter-spacing: 0.04em; line-height: 1; }
.reveal { transition: opacity 0.3s; }
.reveal.hidden { opacity: 0; }
</style>
