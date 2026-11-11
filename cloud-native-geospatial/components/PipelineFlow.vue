<script setup lang="ts">
import { computed } from 'vue'
import { parseChain } from './stages'

/**
 * The read → process → render pipeline. `step` reveals it one stage per click:
 * 1 Raw data, 2 + read → Spatial layer, 3 + process → Processed layer, 4 + render → Image.
 * Omit `step` to show everything.
 */
const props = withDefaults(defineProps<{ chain?: string[], size?: number, step?: number }>(), {
  chain: () => ['raw@1', '>read@2', 'layer@2', '>process@3', 'processed@3', '>render@4', 'image@4'],
  size: 3.2,
})
const items = computed(() => parseChain(props.chain))
</script>

<template>
  <div class="flex justify-center">
    <StageChain :items="items" :size="size" :arrow-width="4.5" :step="step" />
  </div>
</template>
