const STORAGE_ORIGIN = 'https://firebasestorage.googleapis.com'
const EMULATOR_ORIGINS = ['http://127.0.0.1:9199', 'http://localhost:9199']
const TOURNAMENT_PHOTO_PATH = /^\/v0\/b\/[^/]+\/o\/tournaments%2F[^/]+$/
const RENDERABLE_TYPES = ['image/png', 'image/jpeg', 'image/gif']
const MAX_LOGO_BYTES = 5 * 1024 * 1024
const FETCH_TIMEOUT_MS = 3_000

function allowedOrigins(): string[] {
  return process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true'
    ? [STORAGE_ORIGIN, ...EMULATOR_ORIGINS]
    : [STORAGE_ORIGIN]
}

function tournamentPhotoUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    if (!allowedOrigins().includes(url.origin) || !TOURNAMENT_PHOTO_PATH.test(url.pathname)) return null
    return url
  } catch {
    return null
  }
}

export async function loadTournamentLogo(photoUrl: string | null): Promise<string | null> {
  const url = photoUrl ? tournamentPhotoUrl(photoUrl) : null
  if (!url) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), redirect: 'error' })
    const type = res.headers.get('content-type')?.split(';')[0] ?? ''
    if (!res.ok || !RENDERABLE_TYPES.includes(type)) return null
    const bytes = await res.arrayBuffer()
    if (bytes.byteLength > MAX_LOGO_BYTES) return null
    return `data:${type};base64,${Buffer.from(bytes).toString('base64')}`
  } catch {
    return null
  }
}
