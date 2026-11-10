<script setup lang="ts">
import { computed } from 'vue'
import { parseChain } from './stages'

const props = withDefaults(defineProps<{ chain?: string[], size?: number }>(), {
  chain: () => ['raw', '>read', 'layer', '>process', 'processed', '>render', 'image'],
  size: 3.2,
})
const items = computed(() => parseChain(props.chain))
</script>

<template>
  <div class="flex justify-center">
    <StageChain :items="items" :size="size" :arrow-width="6" />
  </div>
</template>
