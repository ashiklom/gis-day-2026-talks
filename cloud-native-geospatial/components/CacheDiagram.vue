<script setup lang="ts">
import { computed } from 'vue'
import { parseChain } from './stages'

/**
 * A tile server with a cache.
 * step 1: request; 2: pipeline runs (stages light up in turn); 3: tile saved to cache + sent back;
 * 4: same request again; 5: cache hit, pipeline skipped. Omit `step` for the final state.
 */
const props = withDefaults(defineProps<{ step?: number, size?: number }>(), { step: 5, size: 1.9 })

const URL = 'GET /landcover/12/1218/1530.png'
const FILE = 'landcover-12-1218-1530.png'
const items = parseChain(['raw', '>read', 'layer', '>process', 'processed', '>render', 'tiles'])

const running = computed(() => props.step === 2 || props.step === 3)
const skipped = computed(() => props.step >= 5)
const cached = computed(() => props.step >= 3)
const hit = computed(() => props.step >= 5)
const reqLabel = computed(() => props.step >= 4 ? `${URL}  (again)` : URL)
const showReq = computed(() => props.step === 1 || props.step === 2 || props.step >= 4)
const showResp = computed(() => props.step === 3 || props.step >= 5)
const respLabel = computed(() => props.step >= 5 ? 'tile, straight from the cache' : 'tile')
</script>

<template>
  <div class="cd">
    <div class="cd__side box">
      <div class="cd__head"><GeoIcon name="server" :size="1.3" /> Remote server</div>
      <div class="cd__pipewrap">
        <div class="cd__pipe" :class="{ running, skipped }">
          <StageChain :items="items" :size="size" :arrow-width="3" />
        </div>
        <div v-if="skipped" class="cd__skip"><span>skipped</span></div>
      </div>
      <div class="cd__shelf" :class="{ hit }">
        <GeoIcon name="cache" :size="1.3" />
        <span class="cd__shelflbl">cache</span>
        <Transition name="drop">
          <span v-if="cached" class="cd__file mono"><GeoIcon name="image" :size="1" /> {{ FILE }}</span>
        </Transition>
        <span v-if="!cached" class="small-note">(empty)</span>
      </div>
    </div>

    <div class="cd__wires">
      <div class="cd__internet small-note">internet</div>
      <FlowArrow dashed reverse :width="15" class="cd__wire" :class="{ off: !showReq }">
        <span class="mono cd__url">{{ reqLabel }}</span>
      </FlowArrow>
      <FlowArrow dashed :width="15" class="cd__wire" :class="{ off: !showResp, hot: hit }" :label="respLabel" />
      <div v-if="hit" class="cd__note">cache hit: no read, no process, no render</div>
    </div>

    <div class="cd__side box cd__local">
      <div class="cd__head"><GeoIcon name="laptop" :size="1.3" /> Your computer</div>
      <div class="cd__img" :class="{ off: step < 3 }"><GeoIcon name="image" :size="size" label="Image" /></div>
    </div>
  </div>
</template>

<style scoped>
.cd { display: flex; align-items: center; justify-content: center; gap: 0.6rem; }
.cd__side { display: flex; flex-direction: column; gap: 0.5rem; }
.cd__local { align-items: center; align-self: stretch; }
.cd__head { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.85rem; }
.cd__pipe { position: relative; opacity: 0.35; transition: opacity 0.3s; }
.cd__pipe.running { opacity: 1; }
.cd__pipe.running :deep(.chain > *) { animation: light 0.5s both; }
.cd__pipe.running :deep(.chain > *:nth-child(2)) { animation-delay: 0.25s; }
.cd__pipe.running :deep(.chain > *:nth-child(3)) { animation-delay: 0.5s; }
.cd__pipe.running :deep(.chain > *:nth-child(4)) { animation-delay: 0.75s; }
.cd__pipe.running :deep(.chain > *:nth-child(5)) { animation-delay: 1s; }
.cd__pipe.running :deep(.chain > *:nth-child(6)) { animation-delay: 1.25s; }
.cd__pipe.running :deep(.chain > *:nth-child(7)) { animation-delay: 1.5s; }
@keyframes light { from { opacity: 0.2; } to { opacity: 1; } }
.cd__pipe.skipped { opacity: 0.25; }
.cd__pipewrap { position: relative; }
.cd__skip {
  position: absolute; left: 0; right: 0; top: 38%; height: 3px; background: var(--good);
  display: flex; justify-content: center; align-items: center;
}
.cd__skip span {
  background: var(--box-bg); padding: 0 0.6rem; line-height: 1.2;
  color: var(--good); font-weight: 800; font-size: 1rem; letter-spacing: 0.15em; text-transform: uppercase;
}
.cd__shelf {
  display: flex; align-items: center; gap: 0.5rem; min-height: 2.3rem;
  border-top: 2px solid var(--box-border); padding-top: 0.4rem; transition: color 0.3s;
}
.cd__shelflbl { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.cd__file { font-size: 0.68rem; background: var(--bg); border: 1px solid var(--box-border); border-radius: 4px; padding: 0.1rem 0.4rem; display: inline-flex; align-items: center; gap: 0.3rem; transition: all 0.3s; }
.cd__shelf.hit .cd__file { border-color: var(--good); color: var(--good); box-shadow: 0 0 0 2px rgba(22, 101, 52, 0.25); font-weight: 700; }
.cd__wires { display: flex; flex-direction: column; align-items: center; gap: 1.1rem; }
.cd__internet { letter-spacing: 0.1em; text-transform: uppercase; }
.cd__wire { transition: opacity 0.3s; }
.cd__wire.off { opacity: 0; }
.cd__wire.hot { color: var(--good); }
.cd__url { font-style: normal; font-size: 0.68rem; }
.cd__note { color: var(--good); font-weight: 700; font-size: 0.72rem; }
.cd__img { margin: auto 0; transition: opacity 0.3s; }
.cd__img.off { opacity: 0; }
.drop-enter-active { transition: all 0.4s ease-out; }
.drop-enter-from { opacity: 0; transform: translateY(-1.5rem); }
</style>
