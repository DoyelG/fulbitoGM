let apiBase = ''

let getAuthHeaders: () => Promise<Record<string, string>> | Record<string, string> = () => ({})

/** Base URL sin barra final (ej. https://api.example.com). Vacío = rutas relativas (web). */
export function configureApi(opts: { baseUrl: string }) {
  apiBase = opts.baseUrl.replace(/\/$/, '')
}

export function configureAuth(fn: typeof getAuthHeaders) {
  getAuthHeaders = fn
}

export function getApiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return apiBase ? `${apiBase}${p}` : p
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const extra = await Promise.resolve(getAuthHeaders())
  const merged = new Headers(init?.headers)
  for (const [k, v] of Object.entries(extra)) {
    if (v) merged.set(k, v)
  }
  if (init?.body instanceof FormData) {
    merged.delete('Content-Type')
  } else if (init?.body != null && !merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json')
  }
  return fetch(getApiUrl(path), { ...init, headers: merged })
}
