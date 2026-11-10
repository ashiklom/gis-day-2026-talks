<script setup lang="ts">
import type { IconName } from './icons'

type Node = { id: string, x: number, y: number, icon: IconName, label: string, cloud?: boolean }
const W = 820
const H = 260
const hub = { x: 470, y: 130 }
const nodes: Node[] = [
  { id: 'server', x: 330, y: 40, icon: 'server', label: 'Institutional server' },
  { id: 'ftp', x: 330, y: 220, icon: 'storage', label: 'FTP / remote storage' },
  { id: 'ccompute', x: 640, y: 40, icon: 'server', label: 'Cloud compute', cloud: true },
  { id: 'cstorage', x: 640, y: 220, icon: 'storage', label: 'Cloud storage', cloud: true },
]
const laptop = { x: 80, y: 130 }
</script>

<template>
  <div class="where" :style="{ width: `${W}px`, height: `${H}px` }">
    <svg :width="W" :height="H" class="where__lines">
      <line v-for="n in nodes" :key="n.id" :x1="hub.x" :y1="hub.y" :x2="n.x" :y2="n.y"
            stroke="currentColor" stroke-width="2" opacity="0.5" />
      <line :x1="laptop.x + 40" :y1="laptop.y" :x2="hub.x - 50" :y2="hub.y"
            stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 6" opacity="0.8" />
    </svg>
    <div class="where__node" :style="{ left: `${laptop.x}px`, top: `${laptop.y}px` }">
      <GeoIcon name="laptop" :size="3.4" label="Your computer" />
    </div>
    <div class="where__node where__hub" :style="{ left: `${hub.x}px`, top: `${hub.y}px` }">
      <GeoIcon name="internet" :size="2.4" />
      <div class="where__hub-label">internet</div>
    </div>
    <div v-for="n in nodes" :key="n.id" class="where__node" :style="{ left: `${n.x}px`, top: `${n.y}px` }">
      <GeoIcon :name="n.icon" :cloud="n.cloud" :size="2.6" :label="n.label" />
    </div>
  </div>
</template>

<style scoped>
.where { position: relative; margin: 0 auto; }
.where__lines { position: absolute; inset: 0; }
.where__node {
  position: absolute;
  transform: translate(-50%, -50%);
  background: var(--bg);
  padding: 4px;
  border-radius: 8px;
}
.where__hub {
  display: flex; flex-direction: column; align-items: center;
  border: 2px solid var(--box-border);
  border-radius: 999px;
  padding: 10px 16px;
}
.where__hub-label { font-weight: 600; font-size: 0.9rem; letter-spacing: 0.04em; }
</style>
