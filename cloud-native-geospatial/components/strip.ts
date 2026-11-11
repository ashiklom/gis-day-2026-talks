/** One segment of a file drawn by FileStrip.vue (header, an overview level, full-res tiles). */
export type Segment = { id: string, label: string, w: number, tiles: number, kind?: 'meta' | 'data' }
