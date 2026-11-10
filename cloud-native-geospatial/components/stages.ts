import type { IconName } from './icons'

/** Named nodes of the mapping pipeline, reused by every workflow diagram. */
export const STAGES: Record<string, { icon: IconName, label: string }> = {
  raw: { icon: 'raw-data', label: 'Raw data' },
  layer: { icon: 'layer', label: 'Spatial layer' },
  processed: { icon: 'processed-layer', label: 'Processed layer' },
  image: { icon: 'image', label: 'Image' },
  tif: { icon: 'file-tif', label: 'subset.tif' },
  tiles: { icon: 'tiles', label: 'Tiles' },
  map: { icon: 'gis', label: 'Map' },
}

export type ChainItem =
  | { kind: 'stage', key: string, icon: IconName, label: string }
  | { kind: 'arrow', label: string }
  | { kind: 'group', label: string, items: ChainItem[] }

/**
 * Parse a compact chain description:
 *   'raw'        -> stage
 *   '>read'      -> arrow labelled "read"
 *   '[GIS' ... ']' -> group box labelled "GIS"
 *   'raw:My data' -> stage with custom label
 */
export function parseChain(spec: string[]): ChainItem[] {
  const root: ChainItem[] = []
  const stack: ChainItem[][] = [root]
  for (const tok of spec) {
    const cur = stack[stack.length - 1]
    if (tok.startsWith('>')) {
      cur.push({ kind: 'arrow', label: tok.slice(1) })
    }
    else if (tok.startsWith('[')) {
      const g: ChainItem = { kind: 'group', label: tok.slice(1), items: [] }
      cur.push(g)
      stack.push(g.items)
    }
    else if (tok === ']') {
      stack.pop()
    }
    else {
      const [key, custom] = tok.split(':')
      const s = STAGES[key]
      if (!s)
        throw new Error(`Unknown stage "${key}"`)
      cur.push({ kind: 'stage', key, icon: s.icon, label: custom ?? s.label })
    }
  }
  return root
}
