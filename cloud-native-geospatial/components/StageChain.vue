<script setup lang="ts">
import type { ChainItem } from './stages'

defineProps<{ items: ChainItem[], size?: number, arrowWidth?: number }>()
</script>

<template>
  <div class="chain">
    <template v-for="(it, i) in items" :key="i">
      <GeoIcon v-if="it.kind === 'stage'" :name="it.icon" :label="it.label" :size="size ?? 2.2" />
      <FlowArrow v-else-if="it.kind === 'arrow'" :label="it.label" :width="arrowWidth ?? 3.6" />
      <div v-else class="chain-group box">
        <div class="box-title">{{ it.label }}</div>
        <StageChain :items="it.items" :size="size" :arrow-width="arrowWidth" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.chain {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.chain-group { padding: 0.35rem 0.6rem 0.6rem; }
</style>
