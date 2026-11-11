<script setup lang="ts">
import { computed } from 'vue'
import { parseChain } from './stages'

/** `at`: click step at which the wire appears (needs `step`) */
type Wire = { label?: string, dir: 'to-local' | 'to-remote', dashed?: boolean, at?: number }

const props = withDefaults(defineProps<{
  remote: string[]
  local: string[]
  wires: Wire[]
  remoteLabel?: string
  remoteCloud?: boolean
  localLabel?: string
  size?: number
  wireWidth?: number
  /** current click step; chain tokens with `@n` and wires with `at` reveal on it */
  step?: number
}>(), {
  remoteLabel: 'Remote server',
  remoteCloud: false,
  localLabel: 'Your computer',
  size: 2.2,
  wireWidth: 12,
})

const remoteItems = computed(() => parseChain(props.remote))
const localItems = computed(() => parseChain(props.local))
</script>

<template>
  <div class="wf">
    <div class="wf__side box">
      <div class="wf__head">
        <GeoIcon name="server" :cloud="remoteCloud" :size="1.4" />
        <span>{{ remoteLabel }}</span>
      </div>
      <StageChain :items="remoteItems" :size="size" :step="step" />
      <slot name="remote-extra" />
    </div>

    <div class="wf__wires">
      <div class="wf__internet small-note">internet</div>
      <FlowArrow v-for="(w, i) in wires" :key="i" :dashed="w.dashed ?? true"
                 :reverse="w.dir === 'to-remote'" :width="wireWidth"
                 class="wf__wire" :class="{ concealed: step !== undefined && w.at !== undefined && step < w.at }">
        <slot :name="`wire-${i}`">{{ w.label }}</slot>
      </FlowArrow>
    </div>

    <div class="wf__side box">
      <div class="wf__head">
        <GeoIcon name="laptop" :size="1.4" />
        <span>{{ localLabel }}</span>
      </div>
      <StageChain :items="localItems" :size="size" :step="step" />
      <slot name="local-extra" />
    </div>
  </div>
</template>

<style scoped>
.wf {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}
.wf__side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.8rem;
}
.wf__head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  font-weight: 600;
  font-size: 0.85rem;
}
.wf__wires {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
}
.wf__wire { transition: opacity 0.3s; }
.wf__wire.concealed { opacity: 0; }
.wf__internet { letter-spacing: 0.1em; text-transform: uppercase; }
</style>
