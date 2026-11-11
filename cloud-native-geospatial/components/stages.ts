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

/** `at`: click step at which the item appears (undefined = always shown). */
export type ChainItem =
  | { kind: 'stage', key: string, icon: IconName, label: string, tag?: string, at?: number }
  | { kind: 'arrow', label: string, at?: number }
  | { kind: 'group', label: string, items: ChainItem[], at?: number }

/**
 * Parse a compact chain description:
 *   'raw'        -> stage
 *   '>read'      -> arrow labelled "read"
 *   '[GIS' ... ']' -> group box labelled "GIS"
 *   'raw:My data' -> stage with custom label
 *   'raw|2 TB'   -> stage with a small size tag under the label
 *   'raw@3'      -> any token: appears at click step 3 (see StageChain's `step`)
 */
export function parseChain(spec: string[]): ChainItem[] {
  const root: ChainItem[] = []
  const stack: ChainItem[][] = [root]
  for (const raw of spec) {
    const m = raw.match(/^(.*?)(?:@(\d+))?$/)!
    const tok = m[1]
    const at = m[2] !== undefined ? Number(m[2]) : undefined
    const cur = stack[stack.length - 1]
    if (tok.startsWith('>')) {
      cur.push({ kind: 'arrow', label: tok.slice(1), at })
    }
    else if (tok.startsWith('[')) {
      const g: ChainItem = { kind: 'group', label: tok.slice(1), items: [], at }
      cur.push(g)
      stack.push(g.items)
    }
    else if (tok === ']') {
      stack.pop()
    }
    else {
      const [base, tag] = tok.split('|')
      const [key, custom] = base.split(':')
      const s = STAGES[key]
      if (!s)
        throw new Error(`Unknown stage "${key}"`)
      cur.push({ kind: 'stage', key, icon: s.icon, label: custom ?? s.label, tag, at })
    }
  }
  return root
}
