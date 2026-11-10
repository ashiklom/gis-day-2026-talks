<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  dashed?: boolean
  /** Arrow points left instead of right */
  reverse?: boolean
  /** Width in rem */
  width?: number
  color?: string
}>(), { dashed: false, reverse: false, width: 4.5, color: 'currentColor' })
</script>

<template>
  <div class="flow-arrow" :class="{ reverse }" :style="{ minWidth: `${width}rem`, color }">
    <div class="flow-arrow__label">
      <slot>{{ label }}</slot>
    </div>
    <div class="flow-arrow__line" :class="{ dashed }" />
  </div>
</template>

<style scoped>
.flow-arrow {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.9;
}
.flow-arrow__label {
  text-align: center;
  font-size: 0.75rem;
  line-height: 1.1;
  margin-bottom: 0.2rem;
  min-height: 0.9rem;
  font-style: italic;
}
.flow-arrow__line {
  position: relative;
  height: 0;
  border-top: 2px solid currentColor;
  margin-right: 6px;
}
.flow-arrow__line.dashed { border-top-style: dashed; }
.flow-arrow__line::after {
  content: '';
  position: absolute;
  right: -8px;
  top: -7px;
  border-left: 10px solid currentColor;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}
.reverse .flow-arrow__line { margin-right: 0; margin-left: 6px; }
.reverse .flow-arrow__line::after {
  right: auto;
  left: -8px;
  border-left: none;
  border-right: 10px solid currentColor;
}
</style>
