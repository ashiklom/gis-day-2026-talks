<script setup lang="ts">
/**
 * The talk's four sections as a row of four segments.
 * Outline slide: `large`, items revealed one per click via `step`.
 * Section dividers: `current` = 1..4; that segment is filled, the rest stay quiet.
 * The titles are the outline's wording (prompt.md, "Outline").
 */
const props = withDefaults(defineProps<{ current?: number, step?: number, large?: boolean }>(), {
  current: 0,
  large: false,
})

const SECTIONS = [
  'Traditional mapping workflow and its limitations',
  'Mapping without the data: Remote access patterns',
  'Making it fast',
  'Putting it all together: YCGS Bowerbird',
]
const shown = (i: number) => props.step === undefined || props.step > i
const done = (i: number) => props.current > 0 && i + 1 < props.current
</script>

<template>
  <ol class="st" :class="{ large }">
    <li v-for="(s, i) in SECTIONS" :key="s" class="st__item"
        :class="{ concealed: !shown(i), current: current === i + 1, done: done(i) }">
      <span class="st__bar" />
      <span class="st__num">{{ i + 1 }}</span>
      <span class="st__title">{{ s }}</span>
    </li>
  </ol>
</template>

<style scoped>
.st {
  list-style: none; margin: 0; padding: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.9rem;
  font-size: 0.72rem; line-height: 1.3; color: var(--muted);
}
.st__item { display: grid; grid-template-columns: auto 1fr; align-items: baseline; align-content: start; column-gap: 0.4rem; line-height: 1.3; transition: opacity 0.3s; }
.st__item.concealed { opacity: 0; }
.st__bar { grid-column: 1 / 3; height: 6px; border-radius: 3px; background: var(--surface-2); margin-bottom: 0.45rem; }
.st__num { font-weight: 700; }
.st__item.current { color: var(--ink); }
.st__item.current .st__bar { background: var(--yale); }
.st__item.done .st__bar { background: color-mix(in srgb, var(--yale) 35%, var(--bg)); }

/* outline slide: the same track, as the list itself */
.st.large { font-size: 1.15rem; gap: 1.6rem; color: var(--ink); }
.st.large .st__bar { height: 10px; border-radius: 5px; background: var(--yale); margin-bottom: 0.9rem; }
.st.large .st__num { font-family: var(--title-font); font-weight: 600; color: var(--yale); }
</style>
