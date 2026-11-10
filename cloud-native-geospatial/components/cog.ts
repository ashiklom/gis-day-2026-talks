/** The public Sentinel-2 scene over New Haven used throughout the talk (Earth Search / AWS Open Data). */
export const S2_TCI_URL
  = 'https://e84-earth-search-sentinel-data.s3.us-west-2.amazonaws.com/sentinel-2-c1-l2a/18/T/XL/2025/8/S2B_T18TXL_20250804T154608_L2A/TCI.tif'
export const S2_TCI_BYTES = 291_914_733

export function fmtBytes(b: number) {
  // decimal units, to match "292 MB" as reported by S3 / browsers
  if (b < 1e3) return `${b} B`
  if (b < 1e6) return `${Math.round(b / 1e3)} KB`
  if (b < 1e9) return `${(b / 1e6).toFixed(b < 1e8 ? 1 : 0)} MB`
  return `${(b / 1e9).toFixed(2)} GB`
}
