<script setup lang="ts">
/**
 * "One is an overview, one is full resolution": the same HLS scene (HLS.S30.T18TXL.2025276T154009.v2.0)
 * read at native resolution vs. from its 915² overview. Images and numbers come from
 * scripts/hls_overview.py (bytes summed from the files' tile index, all three bands, 2026-11-11).
 * step 1: sizes under each image; 2: red box around downtown New Haven + zoomed insets.
 */
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// box_fraction printed by scripts/hls_overview.py (26 x 26 overview px = 104 x 104 native px, ~3.1 km)
const box = { left: 0.6546, top: 0.2131, size: 0.0284 }
const panels = [
  { img: 'hls-native.png', inset: 'hls-native-inset.png', caption: 'Native', detail: '48 MB; 3660 × 3660 px', insetNote: '30 m pixels' },
  { img: 'hls-overview.png', inset: 'hls-overview-inset.png', caption: 'Overview', detail: '3.3 MB; 915 × 915 px', insetNote: '120 m pixels' },
]
const base = import.meta.env.BASE_URL
</script>

<template>
  <div class="hoe">
    <div v-for="p in panels" :key="p.img" class="hoe__panel">
      <div class="hoe__pair">
        <div class="hoe__imgwrap">
          <img :src="`${base}${p.img}`" class="hoe__img" alt="">
          <div class="hoe__box reveal" :class="{ concealed: step < 2 }"
               :style="{ left: `${box.left * 100}%`, top: `${box.top * 100}%`, width: `${box.size * 100}%`, height: `${box.size * 100}%` }" />
        </div>
        <div class="hoe__inset reveal" :class="{ concealed: step < 2 }">
          <img :src="`${base}${p.inset}`" class="hoe__insetimg" alt="">
          <div class="small-note">{{ p.insetNote }}</div>
        </div>
      </div>
      <div class="hoe__caption reveal" :class="{ concealed: step < 1 }">
        <b>{{ p.caption }}</b> ({{ p.detail }})
      </div>
    </div>
  </div>
</template>

<style scoped>
.hoe { display: flex; justify-content: center; gap: 2rem; margin-top: 0.8rem; }
.hoe__panel { display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem; }
.hoe__pair { display: flex; align-items: flex-start; gap: 0.6rem; }
.hoe__imgwrap { position: relative; width: 290px; height: 290px; }
.hoe__img { width: 100%; height: 100%; display: block; border-radius: 4px; }
.hoe__box { position: absolute; outline: 2px solid #fff; outline-offset: 1px; box-shadow: 0 0 0 4px rgba(0,0,0,0.45); }
.hoe__inset { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
.hoe__insetimg { width: 120px; height: 120px; image-rendering: pixelated; border: 2px solid var(--ink); display: block; }
.hoe__caption { font-size: 1rem; }
.reveal { transition: opacity 0.3s; }
.reveal.concealed { opacity: 0; }
</style>
