<!--
AI instructions

This file is the source of truth for the deck. The deck itself is a Slidev project in this folder (slides.md, components/, snippets/). I revise the talk by editing THIS file only, then asking you to "sync".

How to sync:
- Diff this file against its last committed version (`git diff prompt.md`, or against the commit I name). Change only the slides / demos / notes that correspond to what I edited. Do not regenerate or restyle untouched slides (unless there are changes to shared assets like icons; those should be propagated throughout).
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
    - On the same line, `<click> A <click> -> B <click> -> C` : A click renders everything up to the next click, so the sequence here is: (nothing); <click> makes "A" appear; <click> makes "-> B" appear; <click> makes "-> C" appear.
- <demo settings> = values that drive a live demo (presets, layers, defaults). Edit them freely.
- (stub) in a title = placeholder slide, not written yet.
- Flow notation in diagrams: `A → (verb) → B` is a pipeline step. `[GIS: …]` is a labelled box around steps.
- Text inside <<double angle brackes>> are even more general instructions. These should first be updated to more precise <single-bracked instructions> and any other changes needed to follow the conventions above. Make these changes first and ask me to review; if approved, then commit separately proceed with rendering the rest of the deck.
-->

<Layout convention for every remote/local diagram: remote (servers, storage, cloud) on the LEFT, Your computer on the RIGHT, so data flows left → right into the local pipeline. Most slides already do this; How to make a map, How remote reads work, Overviews, and Bring the compute to the data are flipped to match.>

# (Title Slide)

{{{
The sky is the limit
New capabilities enabled by cloud computing and the modern geospatial software stack

Alexey N. Shiklomanov
Research Software Engineer, Yale Center for Geospatial Solutions

November 16, 2026 · Yale GIS Day 2026

<Cover layout, left-aligned. Small row of icons above the title: cloud, internet, laptop.>
}}}

## Outline

{{{
<Plain text, no border or box.>
<click steps>
(1) Traditional mapping workflow and its limitations
(2) Mapping without the data: Remote access patterns
(3) Making it fast
(4) Putting it all together: YCGS Bowerbird
}}}

# Traditional mapping workflow and its limitations

{{{
<Section divider slide, title only.>
}}}

## How to make a map

Every map you've ever made follows the same steps: read raw data into a spatial layer, process it, then render an image.

To make maps, geographers have lots of tools at their disposal.
The goal of this talk is to show you that there is tremendous flexibility in how the steps of the mapping workflow are executed by these different tools.

{{{
<Left, middle aligned with diagram, bigger> Mapping workflow

<Pipeline diagram, large icons:>
<click> Raw data <click> → (read) → Spatial layer <click> → (process) → Processed layer <click> → (render) → Image

<Left, middle aligned with diagram, bigger> Geographer's toolbox <appears on click 5, below>

<Network diagram. Four solid spokes from the hub, all the same length, mirror-symmetric (nodes at the four corners of a square around the hub). "Internet" icon + label centered inside the hub circle.>
<Remote on the left, local on the right (deck convention): the four nodes and the hub on the left, Your computer on the right.>
Right: a "Your computer" box <laptop icon in its header> containing two nodes side by side: "GIS" <gis icon> and "Web browser" <browser icon>. The whole box connects to the central "Internet" hub <internet icon> with a dashed line. <Shared component (LocalComputerBox), reused by later diagrams.>
The hub links to four nodes:
- Institutional server <server>
- FTP / remote storage <storage>
- Cloud compute <server + cloud badge>
- Cloud storage <storage + cloud badge>

<click steps> (continuing after the 4 pipeline clicks above)
5. "Geographer's toolbox" label + the empty "Your computer" box
6. GIS + Web browser appear inside the box
7. Dashed link, Internet hub, spokes and the four nodes
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
<click> Remote: Raw data
<click> Wire: "download", remote → local (long)
<The "Your computer" box is its final (full) size from the start; the GIS stages fill reserved, invisible space as they appear, so the box never resizes.>
Local: Raw data, then [<click> GIS: <click> → (read) → Spatial layer <click> → (process) → Processed layer <click> → (render) → Image]
}}}

## Traditional mapping workflow: Challenges

{{{
<Left: the three challenge labels, each appearing on its click; the current one bold, earlier ones greyed. Right: a compact traditional-workflow diagram (Remote box · download wire · Your computer box with Raw data → [GIS: Spatial layer → Processed layer → Image]) that switches with each click.>
<click> Data gets out of sync
  <Remote Raw data tinted blue, labelled "v2"; local Raw data tinted orange, labelled "v1"; a large red "≠" between them.>
  <Every local stage after Raw data outlined red, with <rerun icon> "re-run everything".>
<click> Different time or place
  <Remote: a stack of four Raw data icons labelled 2021, 2022, 2023, 2024. Local: only "2024".>
  <A ghosted "2021?" request on the wire, drawn below the "download 2024" arrow; local chain outlined red with <rerun icon> "download again, re-run everything".>
<click> Multiple sources
  <Three small remote boxes stacked (Source A, B, C), each with Raw data and its own download wire.>
  <Local: three Raw data → (read) → three Spatial layers, converging → (process) → one Processed layer → (render) → one Image.>
}}}

## We have more to map than ever

{{{
<click> - We have access to more data than ever
<Sub-bullets in a smaller font than main bullets (about 80%).>
<click>     - NASA alone: >180 PB, 2 billion files, from >1000 instruments and modeling systems; not to mention other agencies (USGS, USDA, NOAA, and more)
<click>     - State and local governments increasingly have their own public data catalogs
<click>     - Commercial data providers
<click> - Our problems are bigger and more complex than ever
<click> - We have more compute resources and capabilities than ever

<click> <Centered, bold> Stop making maps. Start making atlases.
}}}

# Remote access patterns

{{{
<Section divider slide, title only.>
}}}

## Subsetting at the source

Some tools will preprocess data for you. E.g., Climate Engine.

You still download a file, but it's a much smaller file: just your area, just your time period, just the variables you asked for. Then your GIS only has to render it.

(The 12 MB vs 2 TB numbers on the slide are illustrative.)

{{{
<Same two-wire layout as "Mapping at the source".>
Remote: Raw data <size tag: 2 TB> → (subset) → subset.tif <size tag: 12 MB>
Wire 1, local → remote, carrying a request badge:
  <request icon> request
  <gis icon> New Haven only
  <calendar icon> 2020–2024
  <layer icon> 3 of 40 variables
Wire 2, remote → local: "subset.tif" and `12 MB` <monospace>
Local: subset.tif, then [GIS: → (read) → Spatial layer → (render) → Image]
}}}

## *Mapping* at the source

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

[click] The client fills in the zoom level (z) and map position (x, y). [click] At zoom 11, one tile covers New Haven, East Haven, and Branford. [click] Zoom in one level: four times as many tiles, x and y roughly double.

Note on ordering: OSM-style "XYZ" URLs are {z}/{x}/{y}. OGC API – Tiles and WMTS use {tileMatrix}/{tileRow}/{tileCol}, i.e. z/y/x. Same tiles, different order.

This works in QGIS too: Browser panel → XYZ Tiles → New Connection, and paste the URL template.

{{{
Remote: Raw data → (read) → Spatial layer → (process) → Processed layer → (render) → Tiles
Wire 1, local → remote: "GET /{z}/{x}/{y}.png  (× many)"
Wire 2, remote → local: "256 × 256 PNG tiles"
Local: Tiles → (stitch) → Map

Below the diagram, three rows, each appearing on its click. Left column: the annotation (right-aligned, grey). Right column: the full URL in large monospace, with z, x and y each in its own color.

<click steps> (annotation · URL)
1. zoom level (z) and map position x, y · https://tile.openstreetmap.org/{z}/{x}/{y}.png
2. New Haven, East Haven, and Branford · https://tile.openstreetmap.org/11/609/765.png
3. Zoom in on New Haven: x, y roughly double · https://tile.openstreetmap.org/12/1218/1531.png
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

<Code font with ligatures disabled (e.g. `->` stays two characters).>
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
   Also show, small: In practice, adapt an existing tiler, such as:
   - **TiTiler**
   - **rio-tiler**
   - **titiler-xarray**
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

Right: the live map. The Sentinel-2 true-color COG only (no basemap, exactly the code on the left), centered on Yale, zoom 11. Caption: "Sentinel-2 L2A (ESA / Copernicus, via AWS Open Data)". A corner counter shows "N range requests · X MB of 292 MB (P%)".
}}}

# Making it fast

{{{
<Section divider slide, title only.>
}}}

## How remote reads work

Basically: one request to "map" a file (read the metadata), then requests to read exactly the data you need.

[click] "Opening" a file: the local computer retrieves just the metadata header over the internet: one request, 16 KB.

[click] The header describes the data and shows where every chunk lives: size, CRS, tile size, overviews, and a table of byte offsets for every tile.

[click] Then the actual read grabs only the specific bytes needed: here, the one 1024 × 1024 tile containing Yale.

Example:
- Why gdalinfo can be fast even for huge files.
- Why "opening" a large NetCDF is faster than reading it.

{{{
Top row: <storage + cloud icon> "TCI.tif (292 MB)" on the left. <laptop icon> "GDAL / QGIS / browser" on the right. Between them, the current HTTP request in monospace above a dashed arrow (pointing left, toward the file) with a short note.
Middle: the file drawn as a horizontal strip of segments, each a block of tiles <overviews not drawn here; they come in on the Overviews slide>:
  header · 10980² full resolution (121 tiles)
  Axis label: byte 0 → → → byte 291,914,733 (not to scale)

<click steps> (request · arrow note · what lights up)
1. GET Range: bytes=0-16383 · "open": 16 KB · header segment
2. same request. Also show a box "What the 16 KB header says":
     size       10980 × 10980 px, 3 bands, Byte
     CRS        WGS 84 / UTM zone 18N, 10 m pixels
     tiles      1024 × 1024, DEFLATE
     overviews  5490², 2745², 1373², 687²
     index      byte offset + length of every tile
3. GET Range: bytes=127074304-129335295 · "read Yale at 10 m": 2.3 MB · one full-resolution tile
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
<~1 line of extra vertical space here; everything below shifts down>
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
Row 2, Cloud-Optimized GeoTIFF. Segments: hdr + all IFDs + offsets · overviews (5 parts) · full-res tiles (24 tiles) <hidden until click 5>

<click steps>
1. Regular: hdr · header → "IFD is at the end"
2. Regular: IFD · IFD → "offsets are over there"
3. Regular: strip offsets · offset table → where the strips are
4. Regular: one strip · whole-width strips, much more than you need
5. COG: hdr + IFDs + offsets · one read: everything about the file
6. COG: one full-res tile · exactly the tile you need
}}}

## The cloud-optimized family

STUB. Same ideas in each: consolidated metadata up front, data chunked so a reader can grab only what it needs.

{{{
| **Data** | **Cloud-optimized format** |
|---|---|
| Rasters | Cloud-Optimized GeoTIFF (COG) |
| Multidimensional arrays / datacubes | Zarr (GeoZarr), Icechunk |
| Vector (analysis) | GeoParquet |
| Vector (streaming / display) | FlatGeobuf |
| Point clouds | COPC (Cloud-Optimized Point Cloud) |
| Map tiles (raster or vector, e.g. MVT) | PMTiles |
| 3D models (buildings, meshes) | 3D Tiles (OGC) |
}}}

## Overviews

[click] Without overviews, a zoomed-out view has to read every full-resolution tile.

[click] With overviews, a zoomed-out view reads a tile of a small overview instead of the full-resolution data.

{{{
Pre-aggregate data at coarser zoom levels and store in the file.

<Two rows, each in the "How remote reads work" layout (storage + cloud with the row title under it, on the left · request line + arrow · laptop, on the right), with its file strip below. GDAL writes the smallest overview first.>
Row 1, COG without overviews. Strip: header · 10980² full resolution (121 tiles)
Row 2, COG with overviews. Strip: header · 687² (4 tiles) · 1373² (9) · 2745² (36) · 5490² (121) · 10980² full resolution (121)
<Overview tiles are 512 × 512; full-resolution tiles are 1024 × 1024.>

<click steps> (row · request · arrow note · what lights up)
1. Without: header + every full-resolution tile · "show me the whole scene": 220 MB <captured> · all 121 full-resolution tiles
2. With: header + 4 tiles · "show me the whole scene": 0.8 MB <captured> · the four 687² overview tiles

<captured> Tile sizes read from TCI.tif's tile index with GDAL 3.13.3 on 2026-11-11: 121 full-resolution tiles = 219,981,531 bytes; 4 tiles of the 687² overview = 819,517 bytes.
}}}

### Example: HLS

{{{
<Centered> **One is an overview, one is full resolution. Can you tell which is which?**
<Two images side by side, same display size (~360 px square): the whole HLS true-color scene (B04/B03/B02) covering New Haven, HLS.S30.T18TXL.2025276T154009.v2.0 (2025-10-03, 0% cloud), from Microsoft Planetary Computer. Left: rendered from the native 3660 × 3660 (30 m) data. Right: rendered from the 458 × 458 overview (240 m). Both are static PNGs made by a script, committed to public/.>
<click> Under each image:
  Native (XX MB; 3660 × 3660 px)      Overview (XX MB; 458 × 458 px)
  <captured> XX = bytes of all tiles read for the three bands at that level, from the files' tile index.
<click> A small red box (~3 km, around downtown New Haven / Yale) on each image, and under each a zoomed-in inset of that box: the native one sharp (100 × 100 px), the overview one blocky (~12 × 12 px, nearest-neighbour).
}}}

## Bring the compute to the data

STUB. The "cloud computing" half of the title: when the data is in us-west-2, the fastest place to compute on it is in us-west-2.

{{{
<Three rows, each appearing on its click: label on the left, a looping animation on the right. Shared layout: <storage + cloud> "S3 bucket, us-west-2" on the left; Your computer (LocalComputerBox with GIS) on the right; internet wire between. Data = small colored blocks; travel time shows latency (slow over the internet, medium within the region, near-instant inside the computer).>
<click> Download
  <Request → S3; all of the file's blocks stream slowly to the laptop, forming a local copy; then very fast bounces between the local copy and GIS → Image.>
<click> Remote access
  <Header request/response, then a few back-and-forth trips, each fetching one block into a local cache → GIS → Image.>
<click> Compute near the data
  <A tiler <compute + cloud badge> sits next to the bucket inside a "us-west-2" region box. Laptop → tiler: tile request. Tiler ↔ S3: quick bounces (header, then a few blocks), faster than the internet but slower than local reads. Tiler → laptop: one small rendered tile → Image.>

<click> *Understand and measure the performance characteristics of your workflow.*
If your workflow is limited by data access (downloading, reading) or storage, putting compute next to the data is a good idea.
If your workflow is limited by CPU/memory (processing), processing locally probably makes more sense.
}}}

## Caching: Skipping work you've already done

Cloudfront, etc.

{{{
<Same layout as the Maps/Tiles API diagrams: Remote server (left) · wire · Your computer (right). Inside the remote box, under the pipeline, a "cache" shelf <cache icon>, empty at first.>
Remote: Raw data → (read) → Spatial layer → (process) → Processed layer → (render) → Tiles

<click steps>
1. Wire local → remote: `GET /landcover/12/1218/1530.png`
2. The remote pipeline stages light up in turn, ending at Tiles.
3. A file `landcover-12-1218-1530.png` drops onto the cache shelf; the tile goes back over the wire; Local: Image.
4. Wire local → remote again: the same `GET /landcover/12/1218/1530.png`
5. The pipeline stays dim, marked "skipped"; the cached file lights up and goes straight back. Note: "cache hit: no read, no process, no render".
<Cache hits are good: the cached file, the "skipped" mark and the cache-hit note are dark green, not red (here and on "Many ways to cache"). A single strike-through line across the pipeline.>
}}}

### Many ways to cache

{{{
<Three compact rows, label on the left, diagram on the right, each showing the repeat request (the cache hit).>
<click> API server
  <The step-5 diagram from the previous slide, scaled down to fit the row.>
<click> Web browser
  <Inside Your computer: Image on the left, Web browser at the far right; under them a "browser cache" shelf, styled like the remote server's cache shelf, holding `landcover-12-1218-1530.png` (dark green). The repeat request for the same URL never leaves the laptop: browser → its cache → Image; the wire stays idle. Small tag: `Cache-Control: max-age=86400`.>
<click> CDN <cloudflare logo> Cloudflare <cloudfront logo> CloudFront
  <A CDN node <cdn icon> sits on the wire between laptop and server. Two labelled paths: "hit" = CDN cache → laptop; "miss" = CDN → server → CDN stores a copy → laptop.>
}}}

# Putting it all together: YCGS Bowerbird

{{{
<Section divider slide. Left: title, then the URL below as a clickable link, and a QR code for it. Right: screenshot of Bowerbird's default view, captured from the live site.>
https://d3eu3eflreofpm.cloudfront.net/
}}}

## How it works

17 datasets, 44 products, from 7.6 cm aerial photos to a 9 km soil-moisture model.

{{{
<Architecture diagram in the deck's remote/local framing. Right: Your computer → Web browser running Bowerbird (deck.gl). Left: three remote groups, top to bottom in click order, each with its own wire into the browser.>
<click> Local rendering
  <COGs on S3 → range requests → in the browser, deck.gl-raster reads and renders on the GPU → Image.>
<click> Existing tile services <small: OpenStreetMap, Esri, USGS, Planetary Computer, CT ECO, NASA>
  <Remote: Raw data → (read · process · render) → Tiles · wire: GET /{z}/{x}/{y}.png · Local: Tiles → (stitch) → Map>
<click> Our tiler <small: TiTiler on AWS Lambda>, deployed next to the data in 3 regions, behind CloudFront <cdn icon>
  <Three region boxes stacked vertically, one per deployment: us-west-2 · NASA Earthdata / us-east-1 · NOAA GOES / eu-central-1 · ECMWF ERA5 (Zarr). Each: Raw data → (read · process · render) → Tiles.>
  <A CloudFront node with a cache, between the stack and the wire, joined to each region box by a short line; note: "repeat tiles never reach Lambda". One pair of wires, Your computer ↔ CloudFront.>
}}}

# Other topics (draft)

{{{
<Section divider slide.>
Other topics (draft)
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


<!--
==========================================================================
Shared resources (reference for syncing; safe for me to skip)
==========================================================================

Datasets
- Sentinel-2 L2A scene S2B_T18TXL_20250804T154608_L2A, true-color COG (TCI.tif, 291,914,733 bytes), from Earth Search / AWS Open Data:
  https://e84-earth-search-sentinel-data.s3.us-west-2.amazonaws.com/sentinel-2-c1-l2a/18/T/XL/2025/8/S2B_T18TXL_20250804T154608_L2A/TCI.tif
  Defined once in components/cog.ts. Byte offsets and sizes on the remote-read slides come from this file.
  Tile index (read with GDAL 3.13.3 on 2026-11-11): full resolution 1024² tiles, 11 × 11 = 121, 219,981,531 bytes;
  overviews use 512² tiles: 5490² (121), 2745² (36), 1373² (9), 687² (4 tiles, 819,517 bytes). Yale is in full-res tile (7, 2).
- NASA GIBS WMS 1.3.0: https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi
- OpenStreetMap tiles: https://tile.openstreetmap.org/{z}/{x}/{y}.png (© OpenStreetMap contributors)
- "Yale" point used by the tile demos: 41.3111, -72.9267 (components/tilemath.ts)
- GDAL output captured 2026-11-09 with GDAL 3.13.3.

Icon names (use in hints as <name icon>; defined in components/icons.ts)
  where things run: laptop, server, ftp, storage, compute, cloud, internet, browser, cdn (any icon can get a small cloud badge)
  mapping pipeline: raw-data, layer, processed-layer, image, gis, file-tif
  actions / misc:   request, download, tiles, code, terminal, search, calendar, palette, subset, package, warning, rerun, cache
  vendor logos:     cloudflare, cloudfront
  moving / storage: hand, car, truck, ram, ssd, hdd

Pipeline stage names used in flow diagrams (components/stages.ts)
  Raw data, Spatial layer, Processed layer, Image, subset.tif, Tiles, Map
  Chain tokens: 'raw|2 TB' adds a size tag; any token + '@n' appears at click n (WorkflowDiagram / StageChain `step`).

Slide → implementation (slides.md holds layout, text and notes for every slide)
| Slide | Implementation |
|---|---|
| Title | slides.md frontmatter + .cover-* in style.css |
| Outline, section slides | inline in slides.md (layout: section) |
| How to make a map | PipelineFlow.vue, WhereItRuns.vue, LocalComputerBox.vue (shared "Your computer" box) |
| Traditional / Subsetting / Mapping at the source / Tiles API diagrams | WorkflowDiagram.vue (props in slides.md), StageChain.vue, FlowArrow.vue |
| Traditional mapping workflow: Challenges | ChallengesDiagram.vue |
| We have more to map than ever | inline in slides.md (v-clicks) |
| Mapping at the source / Example | MapsApiDemo.vue (PRESETS, VARIABLES, DEFAULT); fallback public/fallback/gibs-default.png |
| Tiles API URL animation | TileUrlTemplate.vue |
| Tiles API / Example | TileUrlDemo.vue (PLACES); fallback osm-tile.png |
| Tiles API / Example: Interactive | TileGridMap.vue; fallback osm-grid.png |
| You can build your own tiler | snippets/tiler.py; highlight line ranges in slides.md |
| Access globally, render locally | code + output inline in slides.md; RemoteReadDiagram.vue |
| Access globally / Example | DeckRasterDemo.vue (live, no basemap); code inline in slides.md; fallback deck-cog.png |
| How remote reads work | RemoteReadAnimation.vue, FileStrip.vue (+ strip.ts) |
| Cloud optimization | inline in slides.md (v-click + table) |
| Cloud optimization / Example | TiffLayoutAnimation.vue |
| The cloud-optimized family | inline in slides.md (table) |
| Overviews | OverviewsAnimation.vue, FileStrip.vue |
| Bring the compute to the data | ComputeNearData.vue (one looping row per mode) |
| Caching / Many ways to cache | CacheDiagram.vue (step), CacheWays.vue (browser, cdn) |
| Bowerbird section slide | inline in slides.md; public/bowerbird.png (`node scripts/capture.mjs bowerbird`), public/bowerbird-qr.svg (qrcode package) |
| How it works | BowerbirdArchitecture.vue |
| Other topics + stubs | inline in slides.md |
Offline fallbacks: `node scripts/capture.mjs fallbacks` while `npm run dev` is running.
Bowerbird screenshot: `node scripts/capture.mjs bowerbird` (no dev server needed).
Screenshots of every slide + click step (for checking a sync): `node scripts/capture.mjs slides <dir>` (ONLY=3,5,7 to limit).

Bowerbird URL: https://d3eu3eflreofpm.cloudfront.net/

Bowerbird source code is on the local machine at ~/projects/yale/multi-resolution-new-haven.
The AWS deployment (probably not needed, but sharing just in case) is at ~/projects/yale/ycgs-aws-infra/stacks/newhaven-satellite-viewer.
-->
