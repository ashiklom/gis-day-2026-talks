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
