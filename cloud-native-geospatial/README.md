# The sky is the limit

*New capabilities enabled by cloud computing and the modern geospatial software stack*
(Yale GIS Day 2026)

Slides are built with [Slidev](https://sli.dev). The source outline is in [`prompt.md`](prompt.md).

```bash
npm install
npm run dev        # http://localhost:3030 ; presenter view (with speaker notes) at /presenter
npm run build      # static site in dist/
npm run export     # PDF (needs: npx playwright install chromium)
```

## Layout

- `slides.md`: the deck. Speaker notes are the `<!-- -->` comment at the end of each slide.
- `components/icons.ts`: **icon library**. Every diagram refers to icons by semantic name (`laptop`, `server`, `storage`, `raw-data`, `layer`, …) through `<GeoIcon name="…" />`. Change an icon here and it changes everywhere. `cloud` adds a small cloud badge (e.g. cloud compute vs. institutional server).
- `components/stages.ts`, `StageChain.vue`, `WorkflowDiagram.vue`: the read → process → render pipeline diagrams, described compactly, e.g. `['raw', '>read', 'layer', '[GIS', ... ']']`.
- Live demos:
  - `MapsApiDemo.vue`: NASA GIBS WMS over New Haven
  - `TileUrlDemo.vue`, `TileGridMap.vue`: OpenStreetMap tiles
  - `DeckRasterDemo.vue`: deck.gl-raster reading a Sentinel-2 COG straight from S3
- Animations: `RemoteReadAnimation.vue`, `TiffLayoutAnimation.vue`, `TileUrlTemplate.vue` (driven by slide clicks).
- `public/fallback/`: cached images shown automatically when a live demo can't reach the network (conference wifi insurance). Regenerate with `node scripts/capture-fallbacks.mjs` while `npm run dev` is running.

## Data used

- Sentinel-2 L2A scene `S2B_T18TXL_20250804T154608_L2A` (TCI.tif, 291,914,733 bytes), from Earth Search / AWS Open Data.
- NASA GIBS WMS (`HLS_S30/L30`, OPERA DSWx-HLS, MODIS NDVI and LST).
- OpenStreetMap tiles (© OpenStreetMap contributors).

GDAL output in the slides was captured on 2026-11-09 with GDAL 3.13.3.
