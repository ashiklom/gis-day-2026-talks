<script setup lang="ts">
import type { ChainItem } from './stages'

/**
 * `step`: current click step. Items with `at` (from the `@n` token suffix) stay hidden
 * (but keep their space) until step >= at. Omit `step` to show everything.
 */
const props = defineProps<{ items: ChainItem[], size?: number, arrowWidth?: number, step?: number }>()
const shown = (it: ChainItem) => props.step === undefined || it.at === undefined || props.step >= it.at
</script>

<template>
  <div class="chain">
    <template v-for="(it, i) in items" :key="i">
      <span v-if="it.kind === 'stage'" class="chain-stage reveal" :class="{ concealed: !shown(it) }">
        <GeoIcon :name="it.icon" :label="it.label" :size="size ?? 2.2" />
        <span v-if="it.tag" class="chain-tag mono">{{ it.tag }}</span>
      </span>
      <FlowArrow v-else-if="it.kind === 'arrow'" class="reveal" :class="{ concealed: !shown(it) }"
                 :label="it.label" :width="arrowWidth ?? 3.6" />
      <div v-else class="chain-group box reveal" :class="{ concealed: !shown(it) }">
        <div class="box-title">{{ it.label }}</div>
        <StageChain :items="it.items" :size="size" :arrow-width="arrowWidth" :step="step" />
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
.chain-stage { display: inline-flex; flex-direction: column; align-items: center; }
.chain-tag {
  margin-top: 0.2rem; font-size: 0.7rem; font-weight: 700; color: var(--ink);
  border: 1px solid currentColor; border-radius: 4px; padding: 0 0.3rem;
}
.chain-group { padding: 0.35rem 0.6rem 0.6rem; }
.reveal { transition: opacity 0.3s; }
.reveal.concealed { opacity: 0; }
</style>
