/** Web Mercator ("slippy map") tile math, as used by OSM/XYZ tile URLs: {z}/{x}/{y} */
export function lonLatToTile(lon: number, lat: number, z: number) {
  const n = 2 ** z
  const latRad = lat * Math.PI / 180
  const fx = (lon + 180) / 360 * n
  const fy = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
  const x = Math.min(n - 1, Math.max(0, Math.floor(fx)))
  const y = Math.min(n - 1, Math.max(0, Math.floor(fy)))
  return { x, y, z, fx: fx - x, fy: fy - y }
}

export const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export function osmTileUrl(z: number, x: number, y: number) {
  return OSM_URL.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))
}

export const YALE = { lat: 41.3111, lon: -72.9267 }
