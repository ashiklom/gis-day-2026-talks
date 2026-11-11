<script setup lang="ts">
/**
 * Compact traditional-workflow diagrams for the three challenges.
 * step 1: data out of sync; 2: different time or place; 3: multiple sources.
 */
defineProps<{ step: number }>()
const years = ['2021', '2022', '2023', '2024']
const sources = ['A', 'B', 'C']
</script>

<template>
  <div class="chd">
    <Transition name="fade" mode="out-in">
      <!-- 1. out of sync -->
      <div v-if="step === 1" key="sync" class="chd__row">
        <div class="box chd__remote">
          <div class="chd__head"><GeoIcon name="server" :size="1.2" /> Remote</div>
          <span class="tint-blue"><GeoIcon name="raw-data" :size="2.6" label="Raw data" /></span>
          <span class="ver tint-blue">v2</span>
        </div>
        <div class="chd__wire">
          <div class="neq">≠</div>
          <FlowArrow dashed label="download (last month)" :width="8" />
        </div>
        <div class="box chd__local">
          <div class="chd__head"><GeoIcon name="laptop" :size="1.2" /> Your computer</div>
          <div class="chd__chain">
            <span class="chd__stack"><span class="tint-orange"><GeoIcon name="raw-data" :size="2.6" label="Raw data" /></span><span class="ver tint-orange">v1</span></span>
            <FlowArrow :width="1.6" />
            <div class="box stale">
              <div class="box-title">GIS</div>
              <StageChain :items="[{ kind: 'stage', key: 'layer', icon: 'layer', label: 'Spatial layer' }, { kind: 'arrow', label: '' }, { kind: 'stage', key: 'processed', icon: 'processed-layer', label: 'Processed layer' }, { kind: 'arrow', label: '' }, { kind: 'stage', key: 'image', icon: 'image', label: 'Image' }]" :size="2" :arrow-width="1.6" />
            </div>
          </div>
          <div class="rerun"><GeoIcon name="rerun" :size="1.1" /> re-run everything</div>
        </div>
      </div>

      <!-- 2. different time or place -->
      <div v-else-if="step === 2" key="time" class="chd__row">
        <div class="box chd__remote">
          <div class="chd__head"><GeoIcon name="server" :size="1.2" /> Remote</div>
          <div class="chd__years">
            <span v-for="y in years" :key="y" class="chd__stack"><GeoIcon name="raw-data" :size="1.7" /><span class="ver">{{ y }}</span></span>
          </div>
        </div>
        <div class="chd__wire">
          <FlowArrow dashed label="download 2024" :width="8" />
          <FlowArrow dashed reverse :width="8" class="ghost">"2021?"</FlowArrow>
        </div>
        <div class="box chd__local">
          <div class="chd__head"><GeoIcon name="laptop" :size="1.2" /> Your computer</div>
          <div class="chd__chain">
            <span class="chd__stack"><GeoIcon name="raw-data" :size="2.6" label="Raw data" /><span class="ver">2024</span></span>
            <FlowArrow :width="1.6" />
            <div class="box stale">
              <div class="box-title">GIS</div>
              <StageChain :items="[{ kind: 'stage', key: 'layer', icon: 'layer', label: 'Spatial layer' }, { kind: 'arrow', label: '' }, { kind: 'stage', key: 'processed', icon: 'processed-layer', label: 'Processed layer' }, { kind: 'arrow', label: '' }, { kind: 'stage', key: 'image', icon: 'image', label: 'Image' }]" :size="2" :arrow-width="1.6" />
            </div>
          </div>
          <div class="rerun"><GeoIcon name="rerun" :size="1.1" /> download again, re-run everything</div>
        </div>
      </div>

      <!-- 3. multiple sources -->
      <div v-else-if="step >= 3" key="multi" class="chd__row">
        <div class="chd__sources">
          <div v-for="s in sources" :key="s" class="box chd__src">
            <div class="chd__head"><GeoIcon name="server" :size="1" /> Source {{ s }}</div>
            <GeoIcon name="raw-data" :size="1.6" />
          </div>
        </div>
        <div class="chd__wires3">
          <FlowArrow v-for="s in sources" :key="s" dashed label="download" :width="5.5" />
        </div>
        <div class="box chd__local">
          <div class="chd__head"><GeoIcon name="laptop" :size="1.2" /> Your computer</div>
          <div class="chd__chain">
            <div class="chd__three">
              <div v-for="s in sources" :key="s" class="chd__chain">
                <GeoIcon name="raw-data" :size="1.6" />
                <FlowArrow label="read" :width="2.6" />
                <GeoIcon name="layer" :size="1.6" />
              </div>
            </div>
            <div class="chd__bracket" />
            <StageChain :items="[{ kind: 'arrow', label: 'process' }, { kind: 'stage', key: 'processed', icon: 'processed-layer', label: 'Processed layer' }, { kind: 'arrow', label: 'render' }, { kind: 'stage', key: 'image', icon: 'image', label: 'Image' }]" :size="2.2" :arrow-width="3" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.chd { min-height: 230px; display: flex; align-items: center; }
.chd__row { display: flex; align-items: center; gap: 0.5rem; }
.chd__head { display: flex; align-items: center; gap: 0.3rem; font-weight: 600; font-size: 0.75rem; align-self: flex-start; margin-bottom: 0.3rem; }
.chd__remote, .chd__local, .chd__src { display: flex; flex-direction: column; align-items: center; }
.chd__wire, .chd__wires3 { display: flex; flex-direction: column; align-items: center; gap: 0.8rem; }
.chd__wires3 { gap: 2.2rem; }
.chd__chain { display: flex; align-items: center; gap: 0.3rem; }
.chd__stack { display: inline-flex; flex-direction: column; align-items: center; }
.chd__years { display: grid; grid-template-columns: 1fr 1fr; gap: 0.3rem 0.6rem; }
.chd__sources { display: flex; flex-direction: column; gap: 0.4rem; }
.chd__src { padding: 0.3rem 0.6rem; }
.chd__three { display: flex; flex-direction: column; gap: 0.5rem; }
.chd__bracket { width: 10px; align-self: stretch; margin: 0.6rem 0; border: 2px solid currentColor; border-left: none; border-radius: 0 8px 8px 0; opacity: 0.6; }
.ver { font-size: 0.7rem; font-weight: 700; font-family: var(--slidev-code-font-family, monospace); }
.tint-blue { color: var(--remote); }
.tint-orange { color: var(--warn); }
.neq { color: var(--warn); font-size: 2.6rem; font-weight: 800; line-height: 1; }
.stale { border: 2px solid var(--warn); background: color-mix(in srgb, var(--warn) 8%, var(--bg)); padding: 0.3rem 0.5rem 0.5rem; }
.rerun { color: var(--warn); font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; gap: 0.3rem; margin-top: 0.4rem; }
.ghost { opacity: 0.45; color: var(--warn); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
