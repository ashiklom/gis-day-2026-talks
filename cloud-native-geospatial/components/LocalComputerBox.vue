<script setup lang="ts">
import type { IconName } from './icons'

/**
 * "Your computer": a box with the local tools inside (GIS + Web browser by default).
 * Shared by the toolbox network, the compute-near-data rows and the caching diagrams.
 */
withDefaults(defineProps<{
  tools?: { icon: IconName, label: string }[]
  /** show the tools (false = empty box, same size) */
  showTools?: boolean
  size?: number
  title?: string
}>(), {
  tools: () => [{ icon: 'gis', label: 'GIS' }, { icon: 'browser', label: 'Web browser' }],
  showTools: true,
  size: 2.4,
  title: 'Your computer',
})
</script>

<template>
  <div class="lcb box">
    <div class="lcb__head"><GeoIcon name="laptop" :size="1.3" /><span>{{ title }}</span></div>
    <div class="lcb__tools" :class="{ concealed: !showTools }">
      <GeoIcon v-for="t in tools" :key="t.label" :name="t.icon" :label="t.label" :size="size" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.lcb { display: inline-flex; flex-direction: column; gap: 0.4rem; padding-bottom: 0.7rem; }
.lcb__head { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.85rem; }
.lcb__tools { display: flex; gap: 1.1rem; justify-content: center; align-items: flex-end; transition: opacity 0.3s; }
.lcb__tools.concealed { opacity: 0; }
</style>
