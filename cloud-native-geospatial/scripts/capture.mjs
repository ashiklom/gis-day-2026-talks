// Screenshot helper. Run while `npm run dev` is serving on :3030.
//
//   node scripts/capture.mjs fallbacks      -> refresh public/fallback/*.png from the live demos
//   node scripts/capture.mjs bowerbird      -> public/bowerbird.png (live Bowerbird site, default view;
//                                              doesn't need the dev server)
//   node scripts/capture.mjs slides <dir>   -> screenshot every slide + click step into <dir>
//                                              (ONLY=3,5,7 to limit to some slides)
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-chromium'

const BASE = process.env.SLIDES_URL ?? 'http://localhost:3030'
const [mode = 'slides', outDir = 'shots'] = process.argv.slice(2)

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 })
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function open(no, clicks = 0, wait = 1200) {
  await page.goto(`${BASE}/${no}?clicks=${clicks}`, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await sleep(wait)
}

/** slide number of the first slide whose <h1> contains `text` */
async function findSlide(text) {
  for (let i = 1; i <= 40; i++) {
    await open(i, 0, 300)
    const h = await page.locator('h1:visible').first().textContent({ timeout: 2000 }).catch(() => '')
    if (h?.includes(text))
      return i
  }
  throw new Error(`slide "${text}" not found`)
}

if (mode === 'bowerbird') {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('https://d3eu3eflreofpm.cloudfront.net/', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {})
  await sleep(12000)
  await page.screenshot({ path: 'public/bowerbird.png' })
  console.log('public/bowerbird.png')
}
else if (mode === 'fallbacks') {
  const dir = 'public/fallback'
  await mkdir(dir, { recursive: true })

  // Tiles: the centre tile at the default place, and the interactive map
  let n = await findSlide('Tiles API')
  await open(n + 1, 0, 3000)
  // screenshot the tile as the browser rendered it (OSM blocks non-browser clients)
  await page.evaluate(() => document.querySelectorAll('.pin').forEach(e => (e.style.display = 'none')))
  await page.locator('.cell.centre img:visible').first().screenshot({ path: `${dir}/osm-tile.png` })
  await open(n + 2, 0, 5000)
  await page.locator('.tgm__map:visible').screenshot({ path: `${dir}/osm-grid.png` })

  // deck.gl COG demo
  n = await findSlide('Access globally')
  await open(n + 1, 0, 15000)
  await page.locator('.deck-demo:visible').screenshot({ path: `${dir}/deck-cog.png` })
  console.log('fallbacks written to', dir, '(gibs-default.png is fetched separately; see README)')
}
else {
  await mkdir(outDir, { recursive: true })
  await open(1)
  const total = await page.evaluate(() => window.__slidev__?.nav?.total ?? 0) || 25
  const only = process.env.ONLY?.split(',').map(Number)
  for (let i = 1; i <= total; i++) {
    if (only && !only.includes(i))
      continue
    await open(i, 0, 300)
    const clicks = await page.evaluate(() => window.__slidev__?.nav?.clicksTotal ?? 0)
    for (let c = 0; c <= clicks; c++) {
      await open(i, c, c === 0 ? 2500 : 700)
      const name = `${outDir}/${String(i).padStart(2, '0')}-${c}.png`
      await page.screenshot({ path: name })
      console.log(name)
    }
  }
}
await browser.close()
