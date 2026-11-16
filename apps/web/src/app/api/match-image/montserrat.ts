const FONT_CSS_URL = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@'
const FONT_FILE_ORIGIN = 'https://fonts.gstatic.com/'
const FONT_URL_PATTERN = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/
const FETCH_TIMEOUT_MS = 3_000

export type MontserratFont = { name: 'Montserrat'; data: ArrayBuffer; weight: 500 | 800; style: 'normal' }

const WEIGHTS = [500, 800] as const

let cached: Promise<MontserratFont[]> | null = null

async function fetchWeight(weight: 500 | 800): Promise<MontserratFont> {
  const css = await fetch(`${FONT_CSS_URL}${weight}`, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!css.ok) throw new Error(`Montserrat ${weight} css: ${css.status}`)
  const url = (await css.text()).match(FONT_URL_PATTERN)?.[1]
  if (!url?.startsWith(FONT_FILE_ORIGIN)) throw new Error(`Montserrat ${weight}: no font file`)
  const file = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  if (!file.ok) throw new Error(`Montserrat ${weight} file: ${file.status}`)
  return { name: 'Montserrat', data: await file.arrayBuffer(), weight, style: 'normal' }
}

export async function loadMontserrat(): Promise<MontserratFont[]> {
  cached ??= Promise.all(WEIGHTS.map(fetchWeight))
  try {
    return await cached
  } catch {
    cached = null
    return []
  }
}
