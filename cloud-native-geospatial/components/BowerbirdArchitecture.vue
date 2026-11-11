<script setup lang="ts">
import { parseChain } from './stages'

/**
 * Bowerbird, simplified, in the deck's remote (left) / local (right) framing.
 * Rows top to bottom in click order:
 * step 1: COGs rendered in the browser; 2: existing tile services;
 * 3: our tiler, deployed next to the data in 3 regions, behind one CloudFront cache.
 * Source: multi-resolution-new-haven (terraform module v0.8.2).
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 3 })
const on = (n: number) => props.step >= n

const regions = [
  { region: 'us-west-2', data: 'NASA' },
  { region: 'us-east-1', data: 'NOAA' },
  { region: 'eu-central-1', data: 'ECMWF (ERA5)' },
]
const tilesToMap = parseChain(['tiles', '>stitch', 'map'])
const cogToImage = parseChain(['raw:COG', '>read + render (GPU)', 'image'])
const remoteTiles = parseChain(['raw', '>read · process · render', 'tiles'])
const tilerChain = parseChain(['raw', '>read · process · render', 'tiles'])
</script>

<template>
  <div class="bba">
    <div class="bba__localbg box" />
    <div class="bba__localhead">
      <GeoIcon name="laptop" :size="1.2" /> Your computer
      <span class="bba__browser"><GeoIcon name="browser" :size="1.1" /> Web browser: Bowerbird (deck.gl)</span>
    </div>

    <!-- 1. local rendering -->
    <div class="bba__remote box reveal bba__cogs" :class="{ concealed: !on(1) }" style="grid-row: 2">
      <GeoIcon name="storage" cloud :size="1.6" />
      <div>
        <div class="bba__title">COGs on S3</div>
        <div class="small-note">no tiler: the browser reads them directly</div>
      </div>
    </div>
    <div class="bba__wire reveal" :class="{ concealed: !on(1) }" style="grid-row: 2">
      <FlowArrow dashed :width="10" label="HTTP range requests" />
    </div>
    <div class="bba__local reveal" :class="{ concealed: !on(1) }" style="grid-row: 2">
      <StageChain :items="cogToImage" :size="1.8" :arrow-width="5.5" />
    </div>

    <!-- 2. existing tile services -->
    <div class="bba__remote box reveal" :class="{ concealed: !on(2) }" style="grid-row: 3">
      <div class="bba__title">Existing tile services</div>
      <div class="small-note">OpenStreetMap, Esri, USGS, Planetary Computer, CT ECO, NASA</div>
      <StageChain class="bba__wide" :items="remoteTiles" :size="1.6" :arrow-width="16" />
    </div>
    <div class="bba__wire reveal" :class="{ concealed: !on(2) }" style="grid-row: 3">
      <FlowArrow dashed reverse :width="10"><span class="mono bba__url">GET /{z}/{x}/{y}.png</span></FlowArrow>
      <FlowArrow dashed :width="10" label="PNG tiles" />
    </div>
    <div class="bba__local reveal" :class="{ concealed: !on(2) }" style="grid-row: 3">
      <StageChain :items="tilesToMap" :size="1.8" :arrow-width="2.8" />
    </div>

    <!-- 3. our tiler in 3 regions, behind CloudFront -->
    <div class="bba__remote box reveal" :class="{ concealed: !on(3) }" style="grid-row: 4">
      <div class="bba__title">Our tiler <span class="small-note">TiTiler on AWS Lambda, deployed next to the data in 3 regions</span></div>
      <div class="bba__tiler">
        <div class="bba__stack">
          <div v-for="r in regions" :key="r.region" class="bba__region">
            <GeoIcon name="compute" cloud :size="1.1" />
            <div class="bba__regionname">
              <div class="bba__regionlbl mono">{{ r.region }}</div>
              <div class="bba__regiondata">{{ r.data }}</div>
            </div>
            <StageChain :items="tilerChain" :size="1.05" :arrow-width="3.8" />
          </div>
          <div class="bba__bracket" />
        </div>
        <div class="bba__cdn">
          <GeoIcon name="cloudfront" :size="1.4" />
          <b>CloudFront</b>
          <span class="bba__cdncache"><GeoIcon name="cache" :size="0.85" /> cache</span>
          <span class="bba__cdnnote">repeat tiles never reach Lambda</span>
        </div>
      </div>
    </div>
    <div class="bba__wire reveal" :class="{ concealed: !on(3) }" style="grid-row: 4">
      <FlowArrow dashed reverse :width="10"><span class="mono bba__url">GET /datasets/…/{z}/{x}/{y}</span></FlowArrow>
      <FlowArrow dashed :width="10" label="tiles" />
    </div>
    <div class="bba__local reveal" :class="{ concealed: !on(3) }" style="grid-row: 4">
      <StageChain :items="tilesToMap" :size="1.8" :arrow-width="2.8" />
    </div>
  </div>
</template>

<style scoped>
.bba {
  display: grid; grid-template-columns: 1fr 176px 232px; grid-template-rows: auto auto auto auto;
  gap: 0.45rem 0.4rem; align-items: center; font-size: 0.8rem;
}
.bba__localbg { grid-column: 3; grid-row: 1 / 5; align-self: stretch; z-index: 0; }
.bba__localhead { grid-column: 3; grid-row: 1; z-index: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem; font-weight: 600; padding: 0.4rem 0.6rem 0; }
.bba__browser { font-weight: 400; font-size: 0.72rem; display: inline-flex; align-items: center; gap: 0.25rem; }
.bba__remote { grid-column: 1; padding: 0.35rem 0.6rem 0.45rem; display: flex; flex-direction: column; gap: 0.15rem; }
.bba__cogs { flex-direction: row; align-items: center; gap: 0.6rem; }
.bba__title { font-weight: 700; font-size: 0.8rem; }
.bba__wire { grid-column: 2; display: flex; flex-direction: column; align-items: center; gap: 0.35rem; }
.bba__local { grid-column: 3; z-index: 1; display: flex; justify-content: center; }
.bba__url { font-style: normal; font-size: 0.66rem; white-space: nowrap; }

.bba__tiler { display: flex; align-items: center; gap: 0; margin-top: 0.2rem; }
.bba__stack { position: relative; display: flex; flex-direction: column; gap: 0.3rem; padding-right: 16px; }
.bba__region {
  position: relative; display: flex; align-items: center; gap: 0.4rem;
  border: 1.5px dashed var(--remote); border-radius: 8px; padding: 0.1rem 0.4rem; background: var(--bg);
}
/* short line from each region box to the bracket */
.bba__region::after { content: ''; position: absolute; right: -17px; top: 50%; width: 16px; border-top: 1.5px solid var(--muted); }
/* vertical bracket joining the three lines, then on to CloudFront */
.bba__bracket { position: absolute; right: 0; top: 16.6%; bottom: 16.6%; border-right: 1.5px solid var(--muted); }
.bba__bracket::after { content: ''; position: absolute; right: -14px; top: 50%; width: 14px; border-top: 1.5px solid var(--muted); }
.bba__region :deep(.flow-arrow__label) { font-size: 0.6rem; margin-bottom: 0.1rem; }
/* the tiler rows are small, so their arrows are too: thinner line, smaller head */
.bba__region :deep(.flow-arrow__line) { border-top-width: 1.25px; margin-right: 4px; }
.bba__region :deep(.flow-arrow__line::after) { right: -6px; top: -4.6px; border-left-width: 7px; border-top-width: 4px; border-bottom-width: 4px; }
/* the icons were introduced earlier; their captions would be too small to read here */
.bba__region :deep(.geo-icon__label) { display: none; }
.bba__regionname { width: 5.6rem; line-height: 1.1; white-space: nowrap; }
.bba__wide { align-self: center; margin-top: 0.2rem; }
.bba__regionlbl { font-size: 0.7rem; font-weight: 700; color: var(--remote); }
.bba__regiondata { font-size: 0.7rem; }
.bba__cdn {
  margin-left: 14px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.1rem;
  font-size: 0.7rem; line-height: 1.15; background: var(--bg); border: 2px solid var(--good); border-radius: 8px; padding: 0.3rem 0.4rem; width: 6.2rem;
}
.bba__cdncache { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 0.68rem; color: var(--good); font-weight: 600; }
.bba__cdnnote { color: var(--good); font-size: 0.68rem; }
.reveal { transition: opacity 0.3s; }
.reveal.concealed { opacity: 0; }
</style>
