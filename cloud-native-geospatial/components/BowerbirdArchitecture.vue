<script setup lang="ts">
import { parseChain } from './stages'

/**
 * Bowerbird, simplified, in the deck's remote / local framing.
 * step 1: existing tile services; 2: our tiler next to the data in 3 regions;
 * 3: COGs rendered in the browser; 4: CloudFront cache on the tiler's wire.
 * Source: multi-resolution-new-haven (terraform module v0.8.2).
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 4 })
const on = (n: number) => props.step >= n

const regions = [
  { region: 'us-west-2', data: 'NASA Earthdata' },
  { region: 'us-east-1', data: 'NOAA GOES' },
  { region: 'eu-central-1', data: 'ECMWF ERA5 (Zarr)' },
]
const tilesToMap = parseChain(['tiles', '>stitch', 'map'])
const cogToImage = parseChain(['raw:COG', '>read + render (GPU)', 'image'])
const remoteTiles = parseChain(['raw', '>… render', 'tiles'])
const tilerChain = parseChain(['raw', '>read · process · render', 'tiles'])
</script>

<template>
  <div class="bba">
    <div class="bba__localbg box" />
    <div class="bba__localhead">
      <GeoIcon name="laptop" :size="1.2" /> Your computer
      <span class="bba__browser"><GeoIcon name="browser" :size="1.1" /> Web browser: Bowerbird (deck.gl)</span>
    </div>

    <!-- 1. existing tile services -->
    <div class="bba__remote box reveal" :class="{ hidden: !on(1) }" style="grid-row: 2">
      <div class="bba__title">Existing tile services</div>
      <div class="small-note">OpenStreetMap, Esri, USGS, Planetary Computer, CT ECO, NASA VEDA</div>
      <StageChain :items="remoteTiles" :size="1.6" :arrow-width="5" />
    </div>
    <div class="bba__wire reveal" :class="{ hidden: !on(1) }" style="grid-row: 2">
      <FlowArrow dashed reverse :width="11"><span class="mono bba__url">GET /{z}/{x}/{y}.png</span></FlowArrow>
      <FlowArrow dashed :width="11" label="PNG tiles" />
    </div>
    <div class="bba__local reveal" :class="{ hidden: !on(1) }" style="grid-row: 2">
      <StageChain :items="tilesToMap" :size="1.9" :arrow-width="2.8" />
    </div>

    <!-- 2. our tiler -->
    <div class="bba__remote box reveal" :class="{ hidden: !on(2) }" style="grid-row: 3">
      <div class="bba__title">Our tiler <span class="small-note">TiTiler on AWS Lambda, next to the data</span></div>
      <StageChain :items="tilerChain" :size="1.6" :arrow-width="7" />
      <div class="bba__regions">
        <div v-for="r in regions" :key="r.region" class="bba__region">
          <div class="bba__regionlbl mono">{{ r.region }}</div>
          <GeoIcon name="compute" cloud :size="1.3" />
          <div class="bba__regiondata">{{ r.data }}</div>
        </div>
      </div>
    </div>
    <div class="bba__wire reveal" :class="{ hidden: !on(2) }" style="grid-row: 3">
      <div class="bba__cdn reveal" :class="{ hidden: !on(4) }">
        <GeoIcon name="cloudfront" :size="1.3" />
        <div>
          <b>CloudFront</b> <GeoIcon name="cache" :size="0.9" /><br>
          <span class="bba__cdnnote">repeat tiles never reach Lambda</span>
        </div>
      </div>
      <FlowArrow dashed reverse :width="11"><span class="mono bba__url">GET /datasets/…/{z}/{x}/{y}</span></FlowArrow>
      <FlowArrow dashed :width="11" label="tiles" />
    </div>
    <div class="bba__local reveal" :class="{ hidden: !on(2) }" style="grid-row: 3">
      <StageChain :items="tilesToMap" :size="1.9" :arrow-width="2.8" />
    </div>

    <!-- 3. local rendering -->
    <div class="bba__remote box reveal bba__cogs" :class="{ hidden: !on(3) }" style="grid-row: 4">
      <GeoIcon name="storage" cloud :size="1.6" />
      <div>
        <div class="bba__title">COGs on S3</div>
        <div class="small-note">no tiler: the browser reads them directly</div>
      </div>
    </div>
    <div class="bba__wire reveal" :class="{ hidden: !on(3) }" style="grid-row: 4">
      <FlowArrow dashed :width="11" label="HTTP range requests" />
    </div>
    <div class="bba__local reveal" :class="{ hidden: !on(3) }" style="grid-row: 4">
      <StageChain :items="cogToImage" :size="1.9" :arrow-width="5.5" />
    </div>
  </div>
</template>

<style scoped>
.bba {
  display: grid; grid-template-columns: 1fr 175px 300px; grid-template-rows: auto auto auto auto;
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
.bba__url { font-style: normal; font-size: 0.55rem; }
.bba__regions { display: flex; gap: 0.4rem; }
.bba__region { flex: 1; display: flex; flex-direction: column; align-items: center; border: 1.5px dashed var(--accent-2); border-radius: 8px; padding: 0.15rem 0.3rem 0.25rem; }
.bba__regionlbl { font-size: 0.6rem; font-weight: 700; color: var(--accent-2); }
.bba__regiondata { font-size: 0.62rem; text-align: center; }
.bba__cdn { display: flex; align-items: center; gap: 0.35rem; font-size: 0.68rem; line-height: 1.15; background: var(--bg); border: 1.5px solid var(--hot); border-radius: 8px; padding: 0.2rem 0.4rem; }
.bba__cdnnote { color: var(--hot); font-size: 0.6rem; }
.reveal { transition: opacity 0.3s; }
.reveal.hidden { opacity: 0; }
</style>
