<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from './icons'

const props = withDefaults(defineProps<{
  name: IconName
  /** Size in em */
  size?: number
  /** Overlay a small cloud badge (e.g. "compute in a commercial cloud") */
  cloud?: boolean
  label?: string
}>(), { size: 2.5, cloud: false })

const comp = computed(() => icons[props.name])
const Badge = icons.cloud
</script>

<template>
  <span class="geo-icon" :style="{ fontSize: `${size}em` }">
    <span class="geo-icon__glyph">
      <component :is="comp" />
      <span v-if="cloud" class="geo-icon__badge"><component :is="Badge" /></span>
    </span>
    <span v-if="label" class="geo-icon__label">{{ label }}</span>
  </span>
</template>

<style scoped>
.geo-icon {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}
.geo-icon__glyph {
  position: relative;
  display: inline-flex;
}
.geo-icon__badge {
  position: absolute;
  right: -0.35em;
  top: -0.3em;
  font-size: 0.55em;
  color: var(--accent-2);
  background: var(--bg);
  border-radius: 999px;
  padding: 0.05em;
}
.geo-icon__label {
  margin-top: 0.3em;
  font-size: max(0.32em, 0.68rem);
  text-align: center;
  white-space: nowrap;
  opacity: 0.85;
}
</style>
