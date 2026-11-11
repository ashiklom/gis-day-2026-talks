"""Render the "Overviews / Example: HLS" images and measure how many bytes each view reads.

    python3 scripts/hls_overview.py            # writes public/hls-*.png, prints the byte counts

Scene: HLS.S30.T18TXL.2025276T154009.v2.0 (2025-10-03, 0% cloud), from Microsoft Planetary
Computer (anonymous SAS token). True color = B04 / B03 / B02, each a 3660 x 3660 (30 m) Int16 COG
with internal overviews 1830, 915, 458, 229.

- hls-native.png:   the whole scene read at native resolution, averaged down to 915 x 915
- hls-overview.png: the whole scene read from the 915 x 915 overview (120 m)
- hls-*-inset.png:  the same ~3 km box around downtown New Haven / Yale from each
                    (104 x 104 native pixels vs 26 x 26 overview pixels)
(The 458 overview was too coarse: HLS's nearest-neighbour overviews look visibly speckled
next to the native image at slide size. 915 is still an overview and still reads ~1/16 of the bytes.)
Byte counts are summed from each file's tile index (TIFF BLOCK_SIZE_x_y), all three bands.
Needs GDAL with Python bindings and numpy.
"""
import json
import urllib.request

import numpy as np
from osgeo import gdal

gdal.UseExceptions()
gdal.SetConfigOption('GDAL_DISABLE_READDIR_ON_OPEN', 'EMPTY_DIR')

ITEM = 'HLS.S30.T18TXL.2025276T154009.v2.0'
BASE = f'https://hls2euwest.blob.core.windows.net/hls2/S30/18/T/XL/2025/10/03/{ITEM}/{ITEM}'
BANDS = ['B04', 'B03', 'B02']
OVR = 1                          # overview index: 0 = 1830, 1 = 915, 2 = 458
CENTER = (-72.9279, 41.3083)     # Yale Old Campus / New Haven Green
STRETCH = (0, 1300)              # reflectance x 1e4 -> 0..255
OUT = 'public'

token = json.load(urllib.request.urlopen(
    'https://planetarycomputer.microsoft.com/api/sas/v1/token/hls2-s30'))['token']


def tile_bytes(band):
    xb, yb = band.GetBlockSize()
    nx = -(-band.XSize // xb)
    ny = -(-band.YSize // yb)
    return sum(int(band.GetMetadataItem(f'BLOCK_SIZE_{x}_{y}', 'TIFF') or 0)
               for x in range(nx) for y in range(ny))


def to_byte(a):
    a = a.astype('float32')
    a[a < 0] = 0  # nodata (-9999) -> black
    return np.clip((a - STRETCH[0]) / (STRETCH[1] - STRETCH[0]) * 255, 0, 255).astype('uint8')


def write_png(path, rgb):
    h, w = rgb[0].shape
    mem = gdal.GetDriverByName('MEM').Create('', w, h, 3, gdal.GDT_Byte)
    for i, a in enumerate(rgb):
        mem.GetRasterBand(i + 1).WriteArray(a)
    gdal.GetDriverByName('PNG').CreateCopy(path, mem)
    print('wrote', path, f'{w} x {h}')


native, overview = [], []
native_bytes = overview_bytes = 0
for b in BANDS:
    ds = gdal.Open(f'/vsicurl/{BASE}.{b}.tif?{token}')
    band = ds.GetRasterBand(1)
    ovr = band.GetOverview(OVR)
    native_bytes += tile_bytes(band)
    overview_bytes += tile_bytes(ovr)
    native.append(band.ReadAsArray())
    overview.append(ovr.ReadAsArray())
    gt, wkt = ds.GetGeoTransform(), ds.GetProjection()

size = native[0].shape[0]
osize = overview[0].shape[0]
f = size / osize  # 3660 / 915 = 4


def average_down(a):
    """native array -> osize x osize, averaging every native pixel (nodata excluded)"""
    mem = gdal.GetDriverByName('MEM').Create('', size, size, 1, gdal.GDT_Float32)
    mem.GetRasterBand(1).WriteArray(np.where(a < 0, np.nan, a).astype('float32'))
    mem.GetRasterBand(1).SetNoDataValue(float('nan'))
    out = gdal.Translate('', mem, format='MEM', width=osize, height=osize, resampleAlg='average')
    return np.nan_to_num(out.GetRasterBand(1).ReadAsArray(), nan=-1)


# native, averaged down to the overview's size (the "same" picture, made from all the pixels)
small = [average_down(a) for a in native]
write_png(f'{OUT}/hls-native.png', [to_byte(a) for a in small])
write_png(f'{OUT}/hls-overview.png', [to_byte(a) for a in overview])

# the inset box: K x K overview pixels = 104 x 104 native pixels (~3.1 km)
from osgeo import osr
src = osr.SpatialReference(); src.ImportFromEPSG(4326); src.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)
dst = osr.SpatialReference(wkt=wkt)
x, y, _ = osr.CoordinateTransformation(src, dst).TransformPoint(*CENTER)
col, row = (x - gt[0]) / gt[1], (y - gt[3]) / gt[5]
K = round(104 / f)  # 26 at the 915 overview
oc, orow = int(col / f) - K // 2, int(row / f) - K // 2
n0c, n1c, n0r, n1r = (round(v * f) for v in (oc, oc + K, orow, orow + K))
write_png(f'{OUT}/hls-overview-inset.png', [to_byte(a[orow:orow + K, oc:oc + K]) for a in overview])
write_png(f'{OUT}/hls-native-inset.png', [to_byte(a[n0r:n1r, n0c:n1c]) for a in native])

print(json.dumps({
    'native': {'size': size, 'bytes': native_bytes},
    'overview': {'size': osize, 'bytes': overview_bytes},
    'box_fraction': {'left': oc / osize, 'top': orow / osize, 'size': K / osize},
    'box_km': K * f * gt[1] / 1000,
}, indent=2))
