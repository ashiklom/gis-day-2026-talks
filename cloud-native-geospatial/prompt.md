<!--
AI instructions

This file is the source of truth for the deck. The deck itself is a Slidev project in this folder (slides.md, components/, snippets/). I revise the talk by editing THIS file only, then asking you to "sync".

How to sync:
- Diff this file against its last committed version (`git diff prompt.md`, or against the commit I name). Change only the slides / demos / notes that correspond to what I edited. Do not regenerate or restyle untouched slides.
- Use the "Shared resources" section at the bottom to find which file implements each slide, and keep that section up to date when things move.
- New slides: follow the look of the existing ones and reuse the icon library (components/icons.ts, via <GeoIcon name="…" />) and the shared diagram components. Add new icons to the library rather than inlining them.
- If a demo's default view changes, refresh its offline fallback image (`node scripts/capture.mjs fallbacks` while `npm run dev` is running).
- Anything marked <captured> is real command output: if the command or dataset changes, re-run it and paste the real result. Never invent numbers.
- Review edited content for accuracy and completeness. Suggest improvements, but clear them with me before applying anything beyond what I wrote.
- Commit this file together with the matching deck changes, so the next diff starts clean.

Conventions:
- `#` header = section. `##` header = slide. `###` header = continuation slide: same title, new content, its own text shown as a smaller subtitle.
- Plain body text under a header = my speaker notes. They go in the slide's presenter notes, never on the slide itself. `[click]` in the notes marks where I click to advance the slide.
- Text inside {{{ }}} is what appears on the slide. Plain text and bullets in there are shown word for word.
- <angle brackets> inside {{{ }}} = rendering hints / instructions, not shown.
- <click> at the start of a line = that item appears on the next click. A numbered list under <click steps> describes an animation, one step per click.
- <demo settings> = values that drive a live demo (presets, layers, defaults). Edit them freely.
- (stub) in a title = placeholder slide, not written yet.
- Flow notation in diagrams: `A → (verb) → B` is a pipeline step. `[GIS: …]` is a labelled box around steps.
-->

# (Title Slide)

{{{
The sky is the limit
New capabilities enabled by cloud computing and the modern geospatial software stack

Alexey N. Shiklomanov
Research Software Engineer, Yale Center for Geospatial Solutions

November 16, 2026 · Yale GIS Day 2026

<Cover layout, left-aligned. Small row of icons above the title: cloud, internet, laptop.>
}}}

# Introduction

## Concepts

Every map you've ever made follows the same steps: read raw data into a spatial layer, process it, then render an image.

[click] The question for this talk is *where* each of those steps runs: on your laptop, on an institutional server, on an FTP site, or on compute and storage you rent from a commercial cloud. These are all connected by the internet.

{{{
<Centered> The mapping process

<Pipeline diagram, large icons:>
Raw data → (read) → Spatial layer → (process) → Processed layer → (render) → Image

<click> <Centered> Where it runs

<Network diagram:>
Your computer <laptop>, connected by a dashed line to a central "internet" hub <internet icon>.
The hub links to four nodes:
- Institutional server <server>
- FTP / remote storage <storage>
- Cloud compute <server + cloud badge>
- Cloud storage <storage + cloud badge>
}}}

## Traditional mapping workflow

Download locally, create a map.

Problems:
- Data files are big
- Data files are complicated
- Data are often *many* files (thousands of granules or tiles), not one
- Your laptop's disk and RAM are finite
- Local copies go stale: once you download it, it's out of date

{{{
<Workflow diagram: remote box on the left, local (laptop) box on the right, wire between them.>
Remote: Raw data
Wire: "download", remote → local (long)
Local: Raw data, then [GIS: → (read) → Spatial layer → (process) → Processed layer → (render) → Image]
}}}

## Web-based subsetting

Some tools will preprocess data for you. E.g., Climate Engine.

You still download a file, but it's a much smaller file: just your area, just your time period, just the variables you asked for. Then your GIS only has to render it.

(The 12 MB vs 2 TB numbers on the slide are illustrative.)

{{{
Remote: Raw data → (subset) → subset.tif
Wire: download, remote → local, with a badge on the wire:
  download
  <gis icon> New Haven only
  <calendar icon> 2020–2024
  <layer icon> 3 of 40 variables
  `12 MB, not 2 TB` <monospace>
Local: subset.tif, then [GIS: → (read) → Spatial layer → (render) → Image]
}}}

## Maps API

Let someone else's computer draw the map for you.

You send a tiny request: where, when, what, and how it should look. The server does all four steps and sends back a picture.

The long-standing standard for this is OGC WMS (Web Map Service, around since 1999). Its modern successor is OGC API – Maps. Same idea: a request like
`/collections/{id}/map?bbox=-73.05,41.22,-72.80,41.40&datetime=2025-08-04`.

{{{
Remote: Raw data → (read) → Spatial layer → (process) → Processed layer → (render) → Image
Wire 1, local → remote, carrying this request <monospace JSON>:
  { "bbox": [-73.05, 41.22, -72.80, 41.40],
    "time": "2025-08-04",
    "variable": "true-color",
    "colormap": "viridis" }
Wire 2, remote → local: "image.png"
Local: Image
}}}

### Example

This is NASA GIBS, a WMS server, rendering satellite imagery over New Haven on demand.

Change the area, date, or variable and click Update: the browser sends the request on the bottom left. The server reads, processes, and renders, and we get back a PNG.

Note the color map: GIBS pre-defines one style per layer, so the server, not you, decides how it looks. Other Maps APIs let you choose.

Try: Harbor + Long Island Sound with "Surface water". Or switch to MODIS NDVI to see how much coarser 250 m is than 30 m.

(If the network is down, the default view falls back to a cached image.)

{{{
<Live demo against NASA GIBS WMS 1.3.0 (EPSG:4326).>
Left: controls.
- Area dropdown (presets), plus editable W / S / E / N boxes
- Time (date picker)
- Variable dropdown
- Color map: shown but disabled, "(fixed by server)"
- "Update" button: greyed out unless something changed since the last click. Shows "Rendering…" while loading.
Left bottom: "Request" box with the request as JSON, plus the real WMS URL underneath in small monospace.
Right: the rendered PNG, with a caption "NASA GIBS WMS · N.N s round trip".

<demo settings>
Area presets (W, S, E, N):
- Greater New Haven: -73.05, 41.22, -72.80, 41.40   <default>
- Downtown + Yale: -72.96, 41.29, -72.90, 41.33
- Harbor + Long Island Sound: -72.97, 41.20, -72.85, 41.30
- East Rock + Hamden: -72.95, 41.31, -72.86, 41.39
Variables (GIBS layer · dropdown label · color-map description):
- HLS_S30_Nadir_BRDF_Adjusted_Reflectance · True color: HLS Sentinel-2 (30 m) · RGB composite   <default>
- HLS_L30_Nadir_BRDF_Adjusted_Reflectance · True color: HLS Landsat (30 m) · RGB composite
- OPERA_L3_Dynamic_Surface_Water_Extent-HLS · Surface water: OPERA DSWx (30 m) · water classes
- MODIS_Terra_L3_NDVI_16Day · NDVI: MODIS 16-day (250 m) · brown → green
- MODIS_Terra_L3_Land_Surface_Temp_8Day_Day · Land surface temp: MODIS 8-day (1 km) · blue → red
Default time: 2025-08-04
Image width: 640 px (height follows the bbox aspect ratio)
}}}

## Tiles API

The full dataset, interactive.

Same as Maps, but the requests are standardized into a pyramid of 256 × 256 tiles: at zoom z there are 2^z × 2^z tiles. The client figures out which tiles cover the screen and fills in {z}/{x}/{y}.

[click] Zoom picks z. [click] Where you are picks x and y. [click] Pan east one tile: x + 1. [click] Zoom in one level: four times as many tiles, x and y roughly double.

Note on ordering: OSM-style "XYZ" URLs are {z}/{x}/{y}. OGC API – Tiles and WMTS use {tileMatrix}/{tileRow}/{tileCol}, i.e. z/y/x. Same tiles, different order.

This works in QGIS too: Browser panel → XYZ Tiles → New Connection, and paste the URL template.

{{{
Remote: Raw data → (read) → Spatial layer → (process) → Processed layer → (render) → Tiles
Wire 1, local → remote: "GET /{z}/{x}/{y}.png  (× many)"
Wire 2, remote → local: "256 × 256 PNG tiles"
Local: Tiles → (stitch) → Map

Below the diagram, a large monospace URL, with z, x and y each in its own color:
https://tile.openstreetmap.org/{z}/{x}/{y}.png
plus a one-line note under it that changes with each step.

<click steps> (URL · note)
0. {z}/{x}/{y} · The client fills in the blanks…
1. 12/{x}/{y} · zoom level → z
2. 12/1218/1530 · map position → x, y (Yale)
3. 12/1219/1530 · pan east one tile → x + 1
4. 13/2436/3061 · zoom in → z + 1, and x, y roughly double
}}}

### Example

Show a few individual tiles, interactively.

Pick a place and a zoom level, and you can compute exactly which tile contains it and what its URL is. The highlighted tile is the real PNG from tile.openstreetmap.org. The faded ones are its neighbours.

Zoom 0 is the whole world in one tile.

{{{
<Live demo against the OpenStreetMap XYZ tile server.>
Left: Place dropdown, Latitude / Longitude inputs, Zoom slider (0–19).
Then the computed `z = … x = … y = …` (colored like the previous slide), "N tiles at this zoom (2^z × 2^z)", and a "Tile URL" box with the resulting URL.
Right: a 3 × 3 grid of tiles. The center tile (the one the URL points to) is highlighted, with a pin at the exact location. The neighbours are faded.

<demo settings>
Places (lat, lon, zoom):
- Yale (Old Campus): 41.3111, -72.9267, 12   <default>
- Lighthouse Point: 41.2489, -72.9037, 15
- Connecticut: 41.6, -72.7, 7
- The whole world: 0, 0, 0
}}}

### Example: Interactive

Then, show a full interactive example.

The map is just a mosaic of those tiles. Toggle the tile IDs on and pan/zoom: every red box is one HTTP request for one PNG.

Note that this works in QGIS (XYZ Tiles connection with the same URL).

{{{
<Large, centered, interactive OpenStreetMap map (pan + zoom only).>
Overlay on top of the map: each tile outlined with thin red lines and labelled "{X: 1218, Y: 1530, Z: 12}" in bright red. A small toggle turns the overlay on/off.

<demo settings>
Start: centered on Yale (41.3111, -72.9267), zoom 12, overlay on.
}}}

## You can build your own tiler

You just need a way to take X, Y, Z URLs and convert them to images (ideally, fast).

[click] The data can come from anywhere: a COG on S3, a Zarr datacube, a CSV of sensor readings.

[click] Process and render with whatever library fits.

[click] The client never knows: it just gets a PNG with HTTP headers (including caching).

You don't have to write this from scratch: TiTiler / rio-tiler (Development Seed) and titiler-xarray do exactly this.

{{{
Left: this Python pseudocode, word for word:

```python
# GET https://mytiler.org/{dataset}/{time}/{z}/{x}/{y}.png
@app.get("/{dataset}/{time}/{z}/{x}/{y}.png")
def tile(dataset, time, z, x, y):
    bbox = mercantile.xy_bounds(x, y, z)  # tile -> map coordinates

    if dataset == "landcover":  # a Cloud-Optimized GeoTIFF on S3
        with rasterio.open(f"s3://bucket/landcover_{time}.tif") as src:
            data = src.read(1, window=src.window(*bbox), out_shape=(256, 256))
        png = render_png(data, cmap=LANDCOVER_COLORS)

    elif dataset == "temperature":  # a Zarr datacube
        ds = xarray.open_zarr("gs://bucket/climate.zarr")
        da = ds["tas"].sel(time=time, x=slice(bbox.left, bbox.right),
                           y=slice(bbox.top, bbox.bottom))
        png = da.plot.imshow(cmap="RdBu_r").figure.to_png()

    elif dataset == "air-quality":  # point sensors in a CSV
        pts = pandas.read_csv(f"https://sensors.example.org/{time}.csv")
        grid = scipy.interpolate.griddata(pts[["x", "y"]], pts.pm25, tile_grid(bbox))
        png = matplotlib_to_png(grid, cmap="magma")

    return Response(png, headers={
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
    })
```

Right: annotations, each with an icon, that appear as the code highlights move.

<click steps>
1. Highlight the three "read" lines (rasterio.open / xarray.open_zarr / pandas.read_csv). Show: <raw-data icon> Read from different sources
2. Highlight the process/render lines in each branch. Show: <processed-layer icon> Process + render using different libraries
3. Highlight the `return Response(…)` block. Show: <image icon> End result is always a PNG with headers, regardless of source
   Also show, small: In practice: **TiTiler**, **rio-tiler**, **titiler-xarray**, …
}}}

## Access globally, render locally

You can read data directly over the Internet.
- GDAL /vsicurl example
- QGIS example (Layer → Add Raster Layer → Protocol: HTTP(S), paste the same URL)
- DeckGL-raster example (next slide)

`/vsicurl/` tells GDAL "this is a URL, read it with HTTP range requests". This is a real 292 MB Sentinel-2 scene of southern Connecticut on AWS. gdalinfo told us everything about it, including per-band statistics stored in the file's metadata, after downloading 16 KB.

[click] Same file: clip downtown New Haven and compute statistics. Two requests, 4.5 MB (1.5% of the file), about 2 seconds.

(Numbers captured 2026-11-09 with GDAL 3.13.3.)

{{{
<Two states; the click replaces the first with the second.>

State 1: a box titled "<laptop icon> your laptop" containing:

<captured> The `#` lines below the command are its real output (trimmed), shown as comments.

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

Below it, a remote-read diagram: a bar for the whole 292 MB file, with the bytes actually read highlighted ("16 KB" at the start) and a label "gdalinfo".

<click> State 2: same box, with (<captured>, as above):

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

Below it, the same file bar with two reads highlighted: the 16 KB header and a "4.4 MB" chunk around 43% into the file. Label "gdal raster pipeline".
}}}

### Example

DeckGL-raster.

This is running in this slide, in the browser: no tile server anywhere. The counter in the corner is how many bytes the browser actually fetched. Zoom in and out and watch it: zoomed out, it reads the small overviews. Zoomed in, it reads only the full-resolution tiles on screen.

{{{
Left: this JavaScript, word for word:

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
Small note under the code: No server, no tiler: the browser reads, reprojects (UTM → Web Mercator, on the GPU) and renders.

Right: the live map. The Sentinel-2 true-color COG on top of an OSM basemap, centered on Yale, zoom 11. Caption: "Sentinel-2 L2A (ESA / Copernicus, via AWS Open Data) · © OpenStreetMap contributors". A corner counter shows "N range requests · X MB of 292 MB (P%)".
}}}

## How remote reads work

Basically: one request to "map" a file (read the metadata), then requests to read exactly the data you need.

[click] "Opening" a file: the local computer retrieves just the metadata header over the internet: one request, 16 KB.

[click] The header describes the data and shows where every chunk lives: size, CRS, tile size, overviews, and a table of byte offsets for all 171 tiles.

[click] Then the actual read grabs only the specific bytes needed: here, the one 1024 × 1024 tile containing Yale.

[click] Or, for a zoomed-out view, a tile of a small overview instead of the full-resolution data.

Example:
- Why gdalinfo can be fast even for huge files.
- Why "opening" a large NetCDF is faster than reading it.

{{{
Top row: <laptop icon> "GDAL / QGIS / browser" on the left. <storage + cloud icon> "TCI.tif (292 MB)" on the right. Between them, the current HTTP request in monospace above a dashed arrow with a short note.
Middle: the file drawn as a horizontal strip of segments, each a block of tiles (GDAL writes the smallest overview first):
  header · 687² (1 tile) · 1373² (4) · 2745² (9) · 5490² (36) · 10980² full resolution (121)
  Axis label: byte 0 → → → byte 291,914,733 (not to scale)

<click steps> (request · arrow note · what lights up)
1. GET Range: bytes=0-16383 · "open": 16 KB · header segment
2. same request. Also show a box "What the 16 KB header says":
     size       10980 × 10980 px, 3 bands, Byte
     CRS        WGS 84 / UTM zone 18N, 10 m pixels
     tiles      1024 × 1024, DEFLATE
     overviews  5490², 2745², 1373², 687²
     index      byte offset + length of all 171 tiles
3. GET Range: bytes=127074304-129335295 · "read Yale at 10 m": 2.3 MB · one full-resolution tile
4. GET Range: one tile of the 687² overview · "show me the whole scene": ~1 tile · the single 687² overview tile
}}}

## Cloud optimization: Helping remote readers

Analogy: Moving stuff. If moving is fast, you can sort stuff however you want. If moving is slow, you need to pre-package things in a specific way.

The last column scales every latency by the same factor (RAM = 1 s). Reading from memory is grabbing something on your desk. A hard disk is a trip across town. An HTTP request to cloud storage is a cross-country move. That's why the *number of round trips* matters so much for remote data.

HTTP bandwidth is per connection. Readers make many requests in parallel, so total throughput can be much higher.

Cloud optimized formats: Consolidate metadata; predictable formats for reading. Example of regular multi band TIFF vs COG.

{{{
<Centered text>
**The further you go, the better you have to "pack" to maximize the efficiency of each trip.**

<click> <hand icon> If you're moving stuff between rooms, you can make lots of tiny trips carrying stuff by hand.
<click> <car icon> If you're moving across town, you can make a few trips in a car.
<click> <truck icon> If you're moving across the country, you have to pack everything once, neatly, into a truck.
<click> In computers, the relevant limitations are **latency** and **bandwidth**.

<click> <table; icon before each source name>
| Source | Latency (first byte) | Bandwidth | If RAM latency took 1 second… |
|---|---|---|---|
| <ram> RAM | ~100 ns | 20–50 GB/s | 1 second |
| <ssd> SSD (NVMe) | ~20–100 µs | 3–7 GB/s | 3–17 minutes |
| <hdd> Hard disk | ~5–10 ms | 100–200 MB/s | 14–28 hours |
| <internet> HTTP (cloud storage) | ~20–100 ms | 10–100 MB/s per connection | 2–12 days |
}}}

### Example: Cloud-optimizing GeoTIFF

A regular GeoTIFF is perfectly fine on a local disk, where seeking is cheap.

[click] Over HTTP, the reader first gets the 8-byte header, which only says where the directory (IFD) is, often at the end of the file.
[click] The IFD says where the strip offset table is.
[click] The offset table says where the pixel strips are.
[click] Finally pixels, but strips span the full width of the image, so you download far more than your window. And with no overviews, a zoomed-out view means reading the whole file. (For multi-band files, band-interleaved layouts make this worse still.)

[click] A COG puts the header, all IFDs, and all offsets at the very start: one request gets the whole "map" of the file.
[click] Then one request per tile you actually need, at whatever overview level you need.

`gdal raster convert --co COMPRESS=DEFLATE --of COG in.tif out.tif` (or `gdal_translate -of COG`) is all it takes.

{{{
Two rows, each a file drawn as a horizontal strip of segments, with a running "N round trips" counter (it reads "→ pixels!" when the row's last trip is done). Each trip highlights its segment and shows a short label.

Row 1, Regular GeoTIFF. Segments: hdr (small) · pixel data: full-width strips, no overviews (most of the file, 16 strips) · IFD · strip offsets
Row 2, Cloud-Optimized GeoTIFF. Segments: hdr + all IFDs + offsets · overviews (5 parts) · full-res tiles (24 tiles)

<click steps>
1. Regular: hdr · header → "IFD is at the end"
2. Regular: IFD · IFD → "offsets are over there"
3. Regular: strip offsets · offset table → where the strips are
4. Regular: one strip · whole-width strips, much more than you need
5. COG: hdr + IFDs + offsets · one read: everything about the file
6. COG: one full-res tile · exactly the tile you need
}}}

# Coming next (draft)

{{{
<Section divider slide.>
Coming next (draft)
Placeholder slides for sections not yet written
}}}

## Finding data: STAC (stub)

STUB. This is literally how I found the Sentinel-2 file used in this talk: one STAC search on Earth Search (Element 84).

{{{
- SpatioTemporal Asset Catalog: a standard, searchable index of files like the one we just read
- "Sentinel-2 over New Haven, August 2025, < 5% cloud" → a list of COG URLs
- Earth Search, Microsoft Planetary Computer, NASA CMR-STAC, …
}}}

## Tiles without a server: PMTiles (stub)

STUB. PMTiles ties the "Tiles API" and "How remote reads work" sections together: it's the same trick as a COG, applied to map tiles (vector or raster).

{{{
- A whole tile pyramid in **one file** on plain cloud storage
- The client reads a small header + directory, then range-requests individual tiles
- Tiles API + remote reads = no tile server to run
}}}

## The cloud-optimized family (stub)

STUB. Same ideas in each: consolidated metadata up front, data chunked so a reader can grab only what it needs.

{{{
| Data | Cloud-optimized format |
|---|---|
| Rasters | Cloud-Optimized GeoTIFF (COG) |
| Multidimensional arrays / datacubes | Zarr (GeoZarr) |
| Vector (analysis) | GeoParquet |
| Vector (streaming / display) | FlatGeobuf |
| Point clouds | COPC (Cloud-Optimized Point Cloud) |
| Map tiles | PMTiles |
}}}

## Bring the compute to the data (stub)

STUB. The "cloud computing" half of the title: when the data is in us-west-2, the fastest place to compute on it is in us-west-2.

{{{
- So far: the data stayed remote, the computer was yours
- Next: run the analysis *next to* the data (same cloud region): no downloads, much higher bandwidth
- Notebooks / JupyterHub in the cloud, serverless functions, Dask clusters, …
}}}

<!--
==========================================================================
Shared resources (reference for syncing; safe for me to skip)
==========================================================================

Datasets
- Sentinel-2 L2A scene S2B_T18TXL_20250804T154608_L2A, true-color COG (TCI.tif, 291,914,733 bytes), from Earth Search / AWS Open Data:
  https://e84-earth-search-sentinel-data.s3.us-west-2.amazonaws.com/sentinel-2-c1-l2a/18/T/XL/2025/8/S2B_T18TXL_20250804T154608_L2A/TCI.tif
  Defined once in components/cog.ts. Byte offsets and sizes on the remote-read slides come from this file.
- NASA GIBS WMS 1.3.0: https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi
- OpenStreetMap tiles: https://tile.openstreetmap.org/{z}/{x}/{y}.png (© OpenStreetMap contributors)
- "Yale" point used by the tile demos: 41.3111, -72.9267 (components/tilemath.ts)
- GDAL output captured 2026-11-09 with GDAL 3.13.3.

Icon names (use in hints as <name icon>; defined in components/icons.ts)
  where things run: laptop, server, ftp, storage, compute, cloud, internet (any icon can get a small cloud badge)
  mapping pipeline: raw-data, layer, processed-layer, image, gis, file-tif
  actions / misc:   request, download, tiles, code, terminal, search, calendar, palette, subset, package, warning
  moving / storage: hand, car, truck, ram, ssd, hdd

Pipeline stage names used in flow diagrams (components/stages.ts)
  Raw data, Spatial layer, Processed layer, Image, subset.tif, Tiles, Map

Slide → implementation (slides.md holds layout, text and notes for every slide)
| Slide | Implementation |
|---|---|
| Title | slides.md frontmatter + .cover-* in style.css |
| Concepts | PipelineFlow.vue, WhereItRuns.vue |
| Traditional / Web-based subsetting / Maps API / Tiles API diagrams | WorkflowDiagram.vue (props in slides.md), StageChain.vue, FlowArrow.vue |
| Maps API / Example | MapsApiDemo.vue (PRESETS, VARIABLES, DEFAULT); fallback public/fallback/gibs-default.png |
| Tiles API URL animation | TileUrlTemplate.vue |
| Tiles API / Example | TileUrlDemo.vue (PLACES); fallback osm-tile.png |
| Tiles API / Example: Interactive | TileGridMap.vue; fallback osm-grid.png |
| You can build your own tiler | snippets/tiler.py; highlight line ranges in slides.md |
| Access globally, render locally | code + output inline in slides.md; RemoteReadDiagram.vue |
| Access globally / Example | DeckRasterDemo.vue (live); code inline in slides.md; fallback deck-cog.png |
| How remote reads work | RemoteReadAnimation.vue |
| Cloud optimization | inline in slides.md (v-click + table) |
| Cloud optimization / Example | TiffLayoutAnimation.vue |
| Coming next + stubs | inline in slides.md |
Offline fallbacks: `node scripts/capture.mjs fallbacks` while `npm run dev` is running.
Screenshots of every slide + click step (for checking a sync): `node scripts/capture.mjs slides <dir>` (ONLY=3,5,7 to limit).
-->
