<script setup lang="ts">
/**
 * Compact cache-hit diagrams for "Many ways to cache".
 * browser: the repeat request never leaves your computer.
 * cdn: a CDN node between you and the server; hit = served by the CDN, miss = fetched once, then stored.
 */
defineProps<{ variant: 'browser' | 'cdn' }>()
</script>

<template>
  <div class="cw">
    <template v-if="variant === 'browser'">
      <div class="box cw__server cw__dim">
        <div class="cw__head"><GeoIcon name="server" :size="1.1" /> Remote server</div>
        <GeoIcon name="tiles" :size="1.6" label="Tiles" />
      </div>
      <div class="cw__wire cw__dim">
        <FlowArrow dashed :width="9" label="(not used)" />
      </div>
      <div class="box cw__local">
        <div class="cw__head"><GeoIcon name="laptop" :size="1.1" /> Your computer</div>
        <div class="cw__row">
          <GeoIcon name="image" :size="1.6" label="Image" />
          <FlowArrow reverse :width="2.4" class="cw__hot" />
          <GeoIcon name="browser" :size="1.6" label="Web browser" />
          <FlowArrow :width="5.5" class="cw__hot"><span class="mono cw__url">same URL</span></FlowArrow>
          <span class="cw__hotbox"><GeoIcon name="cache" :size="1.6" label="browser cache" /></span>
        </div>
        <div class="mono cw__tag">Cache-Control: max-age=86400</div>
      </div>
    </template>

    <template v-else>
      <div class="box cw__server">
        <div class="cw__head"><GeoIcon name="server" :size="1.1" /> Remote server</div>
        <GeoIcon name="tiles" :size="1.6" label="Tiles" />
      </div>
      <div class="cw__wire">
        <FlowArrow dashed reverse :width="7" class="cw__miss">miss: forward</FlowArrow>
        <FlowArrow dashed :width="7" class="cw__miss">tile → store a copy</FlowArrow>
      </div>
      <div class="box cw__cdn">
        <div class="cw__head"><GeoIcon name="cdn" :size="1.1" /> CDN</div>
        <div class="cw__row"><span class="cw__hotbox"><GeoIcon name="cache" :size="1.6" label="edge cache" /></span></div>
      </div>
      <div class="cw__wire">
        <FlowArrow dashed reverse :width="7" label="request" />
        <FlowArrow dashed :width="7" class="cw__hot" label="hit: tile from the CDN" />
      </div>
      <div class="box cw__local">
        <div class="cw__head"><GeoIcon name="laptop" :size="1.1" /> Your computer</div>
        <GeoIcon name="image" :size="1.6" label="Image" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.cw { display: flex; align-items: center; gap: 0.5rem; }
.cw__head { display: flex; align-items: center; gap: 0.3rem; font-weight: 600; font-size: 0.72rem; margin-bottom: 0.25rem; }
.cw__server, .cw__local, .cw__cdn { display: flex; flex-direction: column; align-items: center; padding: 0.35rem 0.7rem 0.5rem; }
.cw__wire { display: flex; flex-direction: column; gap: 0.6rem; }
.cw__row { display: flex; align-items: center; gap: 0.3rem; }
.cw__dim { opacity: 0.35; }
.cw__hot { color: var(--hot); }
.cw__hotbox { color: var(--hot); }
.cw__miss { opacity: 0.6; }
.cw__url { font-style: normal; font-size: 0.6rem; }
.cw__tag { font-size: 0.6rem; color: var(--muted); margin-top: 0.3rem; }
</style>
