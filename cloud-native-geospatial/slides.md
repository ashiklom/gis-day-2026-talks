---
theme: default
title: The sky is the limit
info: |
  New capabilities enabled by cloud computing and the modern geospatial software stack.
  Alexey N. Shiklomanov, Yale Center for Geospatial Solutions. Yale GIS Day 2026.
author: Alexey N. Shiklomanov
layout: cover
class: text-left
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: fade
mdc: true
colorSchema: light
fonts:
  sans: Inter
  mono: JetBrains Mono
---

<div class="cover-icons">
  <GeoIcon name="cloud" :size="2.2" />
  <GeoIcon name="internet" :size="2.2" />
  <GeoIcon name="laptop" :size="2.2" />
</div>

# The sky is the limit

### New capabilities enabled by cloud computing and the modern geospatial software stack

<div class="cover-meta">

**Alexey N. Shiklomanov**<br>
Research Software Engineer, Yale Center for Geospatial Solutions

November 16, 2026 · Yale GIS Day 2026

</div>

---

# Concepts

<div class="text-center font-semibold mb-2 mt-2">The mapping process</div>

<PipelineFlow :size="3" />

<div v-click>

<div class="text-center font-semibold mt-6 mb-1">Where it runs</div>

<WhereItRuns />

</div>

<!--
Every map you've ever made follows the same steps: read raw data into a spatial layer, process it, then render an image.

[click] The question for this talk is *where* each of those steps runs: on your laptop, on an institutional server, on an FTP site, or on compute and storage you rent from a commercial cloud. These are all connected by the internet.
-->

---

# Traditional mapping workflow

<div class="diagram-stage" style="zoom: 1.05">

<WorkflowDiagram
  :remote="['raw']"
  :local="['raw', '[GIS', '>read', 'layer', '>process', 'processed', '>render', 'image', ']']"
  :wires="[{ label: 'download', dir: 'to-local' }]"
  :wire-width="7"
/>

</div>

<!--
Download locally, create a map.

Problems:
- Data files are big
- Data files are complicated
- Data are often *many* files (thousands of granules or tiles), not one
- Your laptop's disk and RAM are finite
- Local copies go stale: once you download it, it's out of date
-->

---

# Web-based subsetting

<div class="diagram-stage" style="zoom: 1.1">

<WorkflowDiagram
  :remote="['raw', '>subset', 'tif']"
  :local="['tif', '[GIS', '>read', 'layer', '>render', 'image', ']']"
  :wires="[{ dir: 'to-local' }]"
  :wire-width="11"
>
  <template #wire-0>
    <div class="subset-badge">
      <div class="font-semibold not-italic">download</div>
      <div><GeoIcon name="gis" :size="1" /> New Haven only</div>
      <div><GeoIcon name="calendar" :size="1" /> 2020–2024</div>
      <div><GeoIcon name="layer" :size="1" /> 3 of 40 variables</div>
      <div class="mono">12 MB, not 2 TB</div>
    </div>
  </template>
</WorkflowDiagram>

</div>

<!--
Some tools will preprocess data for you. E.g., Climate Engine.

You still download a file, but it's a much smaller file: just your area, just your time period, just the variables you asked for. Then your GIS only has to render it.

(The 12 MB vs 2 TB numbers on the slide are illustrative.)
-->

---

# Maps API

<div class="diagram-stage">

<WorkflowDiagram
  :remote="['raw', '>read', 'layer', '>process', 'processed', '>render', 'image']"
  :local="['image']"
  :wires="[{ dir: 'to-remote' }, { label: 'image.png', dir: 'to-local' }]"
  :wire-width="15"
>
  <template #wire-0>
<pre class="api-json">{ "bbox": [-73.05, 41.22, -72.80, 41.40],
  "time": "2025-08-04",
  "variable": "true-color",
  "colormap": "viridis" }</pre>
  </template>
</WorkflowDiagram>

</div>

<!--
Let someone else's computer draw the map for you.

You send a tiny request: where, when, what, and how it should look. The server does all four steps and sends back a picture.

The long-standing standard for this is OGC WMS (Web Map Service, around since 1999); its modern successor is OGC API – Maps. Same idea: a request like
`/collections/{id}/map?bbox=-73.05,41.22,-72.80,41.40&datetime=2025-08-04`.
-->

---

# Maps API <span class="subtitle">/ Example</span>

<MapsApiDemo />

<!--
This is NASA GIBS, a WMS server, rendering satellite imagery over New Haven on demand.

Change the area, date, or variable and click Update: the browser sends the request on the bottom left; the server reads, processes, and renders; we get back a PNG.

Note the color map: GIBS pre-defines one style per layer, so the server, not you, decides how it looks. Other Maps APIs let you choose.

Try: Harbor + Long Island Sound with "Surface water"; or switch to MODIS NDVI to see how much coarser 250 m is than 30 m.

(If the network is down, the default view falls back to a cached image.)
-->

---
clicks: 4
---

# Tiles API

<div class="mt-4">

<WorkflowDiagram
  :remote="['raw', '>read', 'layer', '>process', 'processed', '>render', 'tiles']"
  :local="['tiles', '>stitch', 'map']"
  :wires="[{ label: 'GET /{z}/{x}/{y}.png  (× many)', dir: 'to-remote' }, { label: '256 × 256 PNG tiles', dir: 'to-local' }]"
  :wire-width="12"
  :size="2"
/>

</div>

<div class="mt-10">
  <TileUrlTemplate :step="$clicks" />
</div>

<!--
The full dataset, interactive.

Same as Maps, but the requests are standardized into a pyramid of 256 × 256 tiles: at zoom z there are 2^z × 2^z tiles. The client figures out which tiles cover the screen and fills in {z}/{x}/{y}.

[click] Zoom picks z. [click] Where you are picks x and y. [click] Pan east one tile: x + 1. [click] Zoom in one level: four times as many tiles, x and y roughly double.

Note on ordering: OSM-style "XYZ" URLs are {z}/{x}/{y}. OGC API – Tiles and WMTS use {tileMatrix}/{tileRow}/{tileCol}, i.e. z/y/x. Same tiles, different order.

This works in QGIS too: Browser panel → XYZ Tiles → New Connection, and paste the URL template.
-->

---

# Tiles API <span class="subtitle">/ Example</span>

<TileUrlDemo />

<!--
Show a few individual tiles, interactively.

Pick a place and a zoom level, and you can compute exactly which tile contains it and what its URL is. The highlighted tile is the real PNG from tile.openstreetmap.org; the faded ones are its neighbours.

Zoom 0 is the whole world in one tile.
-->

---

# Tiles API <span class="subtitle">/ Example: Interactive</span>

<TileGridMap height="410px" />

<!--
Then, show a full interactive example.

The map is just a mosaic of those tiles. Toggle the tile IDs on and pan/zoom: every red box is one HTTP request for one PNG.

Note that this works in QGIS (XYZ Tiles connection with the same URL).
-->

---

# You can build your own tiler

<div class="grid grid-cols-[1fr_230px] gap-5 tiler">

<div>

<<< @/snippets/tiler.py python {all|7,12,18|8-9,13-15,19-20|22-25}

</div>

<div class="flex flex-col gap-4 pt-6 text-sm">
  <div v-click="1" class="annot"><GeoIcon name="raw-data" :size="1.4" /> Read from different sources</div>
  <div v-click="2" class="annot"><GeoIcon name="processed-layer" :size="1.4" /> Process + render using different libraries</div>
  <div v-click="3" class="annot"><GeoIcon name="image" :size="1.4" /> End result is always a PNG with headers, regardless of source</div>
  <div v-click="3" class="small-note mt-4">In practice: <b>TiTiler</b>, <b>rio-tiler</b>, <b>titiler-xarray</b>, …</div>
</div>

</div>

<!--
You just need a way to take X, Y, Z URLs and convert them to images (ideally, fast).

[click] The data can come from anywhere: a COG on S3, a Zarr datacube, a CSV of sensor readings.

[click] Process and render with whatever library fits.

[click] The client never knows: it just gets a PNG with HTTP headers (including caching).

You don't have to write this from scratch: TiTiler / rio-tiler (Development Seed) and titiler-xarray do exactly this.
-->

---
clicks: 1
---

# Access globally, render locally

<v-switch>
<template #0>

<div class="laptop-box box">
<div class="box-title"><GeoIcon name="laptop" :size="1.1" /> your laptop</div>

```bash
export CPL_VSIL_SHOW_NETWORK_STATS=YES   # ask GDAL to count bytes
S2=https://e84-earth-search-sentinel-data.s3.us-west-2.amazonaws.com/\
sentinel-2-c1-l2a/18/T/XL/2025/8/S2B_T18TXL_20250804T154608_L2A/TCI.tif
gdalinfo /vsicurl/$S2
# Size is 10980, 10980
# Coordinate System is: WGS 84 / UTM zone 18N    Pixel Size = (10, -10)
# Image Structure Metadata:  LAYOUT=COG  COMPRESSION=DEFLATE
# Band 1 Block=1024x1024 Type=Byte, ColorInterp=Red
#   Overviews: 5490x5490, 2745x2745, 1373x1373, 687x687
# ...
# Network statistics:  GET count: 1,  downloaded_bytes: 16384
```

</div>

<div class="mt-6" style="zoom: 1.2">
<RemoteReadDiagram :file-bytes="291914733" :reads="[{ start: 0, end: 16383, label: '16 KB' }]" tool="gdalinfo" />
</div>

</template>
<template #1>

<div class="laptop-box box">
<div class="box-title"><GeoIcon name="laptop" :size="1.1" /> your laptop</div>

```bash
gdal raster pipeline read /vsicurl/$S2 \
  ! clip --bbox=-72.95,41.29,-72.90,41.33 --bbox-crs=EPSG:4326 \
  ! info --stats
# Size is 430, 455                                  (downtown New Haven)
# Band 1 ... ColorInterp=Red    Minimum=27, Maximum=255, Mean=93.950
# Band 2 ... ColorInterp=Green  Minimum=43, Maximum=255, Mean=98.793
# Band 3 ... ColorInterp=Blue   Minimum=34, Maximum=255, Mean=89.921
# Network statistics:  GET count: 2,  downloaded_bytes: 4456448    (~2 s)
```

</div>

<div class="mt-6" style="zoom: 1.2">
<RemoteReadDiagram :file-bytes="291914733" :reads="[{ start: 0, end: 16383, label: '' }, { start: 124895232, end: 129335295, label: '4.4 MB' }]" tool="gdal raster pipeline" />
</div>

</template>
</v-switch>

<!--
You can read data directly over the Internet.
- GDAL /vsicurl example
- QGIS example (Layer → Add Raster Layer → Protocol: HTTP(S), paste the same URL)
- DeckGL-raster example (next slide)

`/vsicurl/` tells GDAL "this is a URL, read it with HTTP range requests". This is a real 292 MB Sentinel-2 scene of southern Connecticut on AWS. gdalinfo told us everything about it, including per-band statistics stored in the file's metadata, after downloading 16 KB.

[click] Same file: clip downtown New Haven and compute statistics. Two requests, 4.5 MB (1.5% of the file), about 2 seconds.

(Numbers captured 2026-11-09 with GDAL 3.13.3.)
-->

---

# Access globally, render locally <span class="subtitle">/ Example</span>

<div class="grid grid-cols-[1fr_1.15fr] gap-5 items-start">

<div class="deck-code">

```ts
import { Deck } from '@deck.gl/core'
import { COGLayer } from '@developmentseed/deck.gl-geotiff'

new Deck({
  canvas,
  initialViewState: {
    longitude: -72.93, latitude: 41.31, zoom: 11,
  },
  controller: true,
  layers: [
    new COGLayer({
      id: 'sentinel2',
      // the same 292 MB file, straight from S3
      source: 'https://e84-earth-search-sentinel-data'
        + '.s3.us-west-2.amazonaws.com/…/TCI.tif',
    }),
  ],
})
```

<div class="small-note mt-2">No server, no tiler: the browser reads, reprojects (UTM → Web Mercator, on the GPU) and renders.</div>

</div>

<DeckRasterDemo height="410px" />

</div>

<!--
DeckGL-raster.

This is running in this slide, in the browser: no tile server anywhere. The counter in the corner is how many bytes the browser actually fetched. Zoom in and out and watch it: zoomed out, it reads the small overviews; zoomed in, only the full-resolution tiles on screen.
-->

---
clicks: 4
---

# How remote reads work

<RemoteReadAnimation :step="$clicks" />

<!--
Basically: One request to "map" a file (read the metadata); subsequent requests to read exactly the data you need.

[click] "Opening" a file: the local computer retrieves just the metadata header over the internet: one request, 16 KB.

[click] The header describes the data and shows where every chunk lives: size, CRS, tile size, overviews, and a table of byte offsets for all 171 tiles.

[click] Then the actual read grabs only the specific bytes needed: here, the one 1024 × 1024 tile containing Yale.

[click] Or, for a zoomed-out view, a tile of a small overview instead of the full-resolution data.

Example:
- Why gdalinfo can be fast even for huge files.
- Why "opening" a large NetCDF is faster than reading it.
-->

---
clicks: 5
---

# Cloud optimization: Helping remote readers

<div class="text-center moving">

<div class="text-lg font-semibold mb-3">The further you go, the better you have to "pack" to maximize the efficiency of each trip.</div>

<div v-click="1"><GeoIcon name="hand" :size="1.3" /> If you're moving stuff between rooms, you can make lots of tiny trips carrying stuff by hand.</div>
<div v-click="2"><GeoIcon name="car" :size="1.3" /> If you're moving across town, you can make a few trips in a car.</div>
<div v-click="3"><GeoIcon name="truck" :size="1.3" /> If you're moving across the country, you have to pack everything once, neatly, into a truck.</div>

<div v-click="4" class="mt-3">In computers, the relevant limitations are <b>latency</b> and <b>bandwidth</b>.</div>

</div>

<div v-click="5" class="latency">

| Source | Latency (first byte) | Bandwidth | If RAM latency took 1 second… |
|---|---|---|---|
| <GeoIcon name="ram" :size="1" /> RAM | ~100 ns | 20–50 GB/s | 1 second |
| <GeoIcon name="ssd" :size="1" /> SSD (NVMe) | ~20–100 µs | 3–7 GB/s | 3–17 minutes |
| <GeoIcon name="hdd" :size="1" /> Hard disk | ~5–10 ms | 100–200 MB/s | 14–28 hours |
| <GeoIcon name="internet" :size="1" /> HTTP (cloud storage) | ~20–100 ms | 10–100 MB/s per connection | 2–12 days |

</div>

<!--
Analogy: Moving stuff. If moving is fast, you can sort stuff however you want. If moving is slow, you need to pre-package things in a specific way.

The last column scales every latency by the same factor (RAM = 1 s). Reading from memory is grabbing something on your desk; a hard disk is a trip across town; an HTTP request to cloud storage is a cross-country move. That's why the *number of round trips* matters so much for remote data.

HTTP bandwidth is per connection; readers make many requests in parallel, so total throughput can be much higher.

Cloud optimized formats: Consolidate metadata; predictable formats for reading. Example of regular multi band TIFF vs COG.
-->

---
clicks: 6
---

# Cloud optimization <span class="subtitle">/ Example: Cloud-optimizing GeoTIFF</span>

<div class="mt-4">
<TiffLayoutAnimation :step="$clicks" />
</div>

<!--
A regular GeoTIFF is perfectly fine on a local disk, where seeking is cheap.

[click] Over HTTP, the reader first gets the 8-byte header, which only says where the directory (IFD) is, often at the end of the file.
[click] The IFD says where the strip offset table is.
[click] The offset table says where the pixel strips are.
[click] Finally pixels, but strips span the full width of the image, so you download far more than your window. And with no overviews, a zoomed-out view means reading the whole file. (For multi-band files, band-interleaved layouts make this worse still.)

[click] A COG puts the header, all IFDs, and all offsets at the very start: one request gets the whole "map" of the file.
[click] Then one request per tile you actually need, at whatever overview level you need.

`gdal raster convert --co COMPRESS=DEFLATE --of COG in.tif out.tif` (or `gdal_translate -of COG`) is all it takes.
-->

---
layout: section
---

# Coming next <span class="subtitle">(draft)</span>

<div class="small-note">Placeholder slides for sections not yet written</div>

---

# Finding data: STAC <span class="subtitle">(stub)</span>

- SpatioTemporal Asset Catalog: a standard, searchable index of files like the one we just read
- "Sentinel-2 over New Haven, August 2025, < 5% cloud" → a list of COG URLs
- Earth Search, Microsoft Planetary Computer, NASA CMR-STAC, …

<!--
STUB. This is literally how I found the Sentinel-2 file used in this talk: one STAC search on Earth Search (Element 84).
-->

---

# Tiles without a server: PMTiles <span class="subtitle">(stub)</span>

- A whole tile pyramid in **one file** on plain cloud storage
- The client reads a small header + directory, then range-requests individual tiles
- Tiles API + remote reads = no tile server to run

<!--
STUB. PMTiles ties the "Tiles API" and "How remote reads work" sections together: it's the same trick as a COG, applied to map tiles (vector or raster).
-->

---

# The cloud-optimized family <span class="subtitle">(stub)</span>

| Data | Cloud-optimized format |
|---|---|
| Rasters | Cloud-Optimized GeoTIFF (COG) |
| Multidimensional arrays / datacubes | Zarr (GeoZarr) |
| Vector (analysis) | GeoParquet |
| Vector (streaming / display) | FlatGeobuf |
| Point clouds | COPC (Cloud-Optimized Point Cloud) |
| Map tiles | PMTiles |

<!--
STUB. Same ideas in each: consolidated metadata up front, data chunked so a reader can grab only what it needs.
-->

---

# Bring the compute to the data <span class="subtitle">(stub)</span>

- So far: the data stayed remote, the computer was yours
- Next: run the analysis *next to* the data (same cloud region): no downloads, much higher bandwidth
- Notebooks / JupyterHub in the cloud, serverless functions, Dask clusters, …

<!--
STUB. The "cloud computing" half of the title: when the data is in us-west-2, the fastest place to compute on it is in us-west-2.
-->
