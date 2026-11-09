<!--
AI instructions:
Below is the outline of a presentation. Each section is a top-level header. Each slide is a level 2 header. Same parent slide (title) but with all new content is a level 3 header (its title is a smaller subtitle). My speaker notes are the main body text; these should not appear in the visualized slides (but they may appear in slide comments, handouts, etc., similar to Powerpoint slide notes). Verbatim text / bullets are inside triple curly brace blocks: {{{ }}}. Rendering hints and other instructions are in <angle braces> inside the {{{ }}}.

Reuse icons across slides wherever possible. Consider an icon "library" for these to make them easier to re-use.

Create this presentation in a slide show framework of your choice; probably slidev, unless you have a good reason to use something else.

Also review the content for accuracy and completeness, based on your sense of the context. Suggest improvements, but clear them with me.
-->

# (Title Slide)

{{{
The sky is the limit
New capabilities enabled by cloud computing and the modern geospatial software stack

Alexey N. Shiklomanov
Research Software Engineer, Yale Center for Geospatial Solutions

November 16, 2026
Yale GIS Day 2026
}}}

# Introduction

## Concepts

{{{

<Centered> The mapping process:

<Flowchart with simple vector graphics representing these concepts:>

Raw data -- (read) --> Spatial layer -- (process) --> Processed layer -- (render) --> Image

<Centered> Where it runs.

<icons for each of these>

Local computer <laptop icon>

<Cluster of icons representing institutional servers, FTP sites / remote storage locations, and compute + storage in commercial clouds like AWS and GCP (same storage + compute icons, but with a cloud attached). Cluster is linked together by the word "internet" in the middle. Local computer connected to "internet" via dotted line.>

}}}

## Traditional mapping workflow

Download locally, create a map.

{{{
Raw data sits on a remote server. Deliver to local computer (box with laptop icon) over the internet, via dashed line labeled "download".
Then, on the local computer (still in the same box with the laptop icon), process + render (in a sub-box labeled "GIS").
}}}

Problems:
- Data files are big
- Data files are complicated 

## Web-based subsetting
Some tools will preprocess data for you. E.g., Climate Engine.

{{{
Represent this as: Raw data on a remote store. A remote system processes the data and creates a smaller data file (`.tif`). Concisely represent that the file is smaller and has a specific spatial and/or temporal extent and a subset of variables.
Download the smaller file locally; then, just render in GIS.
}}}

## Maps API
Let someone else's computer draw the map for you.

{{{
Local computer sends a very simple request (bbox, timestep, variable, color map; in monospace font, as JSON) to a remote server.
Remote server does: raw data -- (read) --> layer -- (process) --> processed layer -- (render) --> image.
Image is downloaded to the local computer.
}}}

### Example

{{{

Pick an OGC API - Maps endpoint with data over New Haven at relatively high spatial resolution.
Give me some options here and let me pick.

On the left side, some UI elements for setting a bbox, timestep, variable, and color scheme.
On the left side bottom, the resulting Maps API request from the UI selection.
On the left side, a button that says, "Update"; greyed out and inactive unless selections have changed since the last click.
On the right side, the rendered map.

}}}

## Tiles API

The full dataset, interactive.
Show a few individual tiles, interactively. 
Then, show a full interactive example.
Note that this works in QGIS.

{{{
Same as "Maps" above, but note the XYZ-Tiles-style URL. Some way to simply capture that {z}/{y}/{x} in the URL are replaced based on the current pan + zoom.
}}}

### Example

{{{
Use the OpenStreetMap XYZ tiles endpoint.
On the left, UI to select a center coordinate and a zoom level.
On the left bottom, the URL to the corresponding tile.
On the right, a static PNG of the resulting map.
}}}

### Example: Interactive

{{{
Larger centered UI with interactive OpenStreetMap viewer (basic: just pan + zoom).
On top of the map, overlay tile ids as, e.g., "{X: 23, Y: 18, Z: 12}" in bright red. Use thin red lines to show tile boundaries. Add small UI element to toggle this overlay.
}}}

## You can build your own tiler

You just need a way to take X, Y, Z URLs and convert them to images (ideally, fast).

{{{
Very simple Python pseudocode for a tiling function that reads a fake URL like "mytiler.org/{dataset}/{time}/{z}/{y}/{x}..." and dispatches via if-else on `dataset` to different dataset sources and using different libraries (e.g., one rasterio GeoTIFF, one Xarray dataset.plot, and one scipy + matplotlib) to return a PNG with some HTTP headers at the very end.
On-click, step through the following annotations (highlight code + make text appear):
- Read from different sources
- Process + render using different libraries
- End result is always PNG with headers, regardless of source.
}}}

## Access globally, render locally

You can read data directly over the Internet.
- GDAL /vsicurl example
- QGIS example
- DeckGL-raster example

{{{
Centered: A line of code with a `gdalinfo` command (running locally) with `/vsicurl` against some remote dataset. Laptop icon / box to indicate this is running locally.
Show echoed result, commented out.
Below, a conceptual figure of what happened: Local read against a *small part* of a remote file (illustrate this somehow); only the small read is transferred over the internet locally. Maybe include the true file sizes of the file vs. what was sent to convey this point.

Repeat for another GDAL CLI command that demonstrates fast, small partial reading (grab a subset and calculate some summary statistics...or some other such command that demonstrates this functionality).
}}}

### Example

DeckGL-raster.

{{{
Minimal example that uses deckgl-raster to render some remote publicly accessible COG. Show a relevant slice of the JavaScript code for this on the left. On the right, show the actual visualization.
}}}

## How remote reads work
Basically: One request to "map" a file (read the metadata); subsequent requests to read exactly the data you need.

Example:
- Why gdalinfo can be fast even for huge files.
- Why "opening" a large NetCDF is faster than reading it

{{{
Conceptual figure (with animations that step through this / progressively reveal) illustrating how reading a COG chunk/overview works:
"Opening" a file --- local computer retrieves just the metadata header over the internet.
The metadata header describes the data and shows where the chunks are.
Then, the actual data read grabs only the specific data needed for the request (e.g., a specific overview, or a specific slice of data).
}}}

## Cloud optimization: Helping remote readers
Analogy: Moving stuff. If moving is fast, you can sort stuff however you want. If moving is slow, you need to pre-package things in a specific way.

Cloud optimized formats: Consolidate metadata; predictable formats for reading. Example of regular multi band TIFF vs COG.

{{{
<Centered text:>

The further you go, the better you have to "pack" to maximize the efficiency of each trip.

If you're moving stuff between rooms, you can make lots of tiny trips carrying stuff by hand.

If you're moving across town, you can make a few trips in a car.

If you're moving across the country, you have to pack everything once, neatly, into a truck.

In computers, the relevant limitations are **latency** and **bandwidth**.

<table with columns: source, latency, bandwidth. Populate with typical values for RAM, SSD, HDD, HTTP>
}}}

### Example: Cloud-optimizing GeoTIFF

{{{
Simple diagram of the layout of a regular (not cloud optimized) GeoTiff. Animate the trips required to read data from the COG (highlighting that you have to do multiple requests before you get any data).
Compare to a cloud-optimized GeoTIFF. Same thing, showing that fewer trips are needed.
}}}
