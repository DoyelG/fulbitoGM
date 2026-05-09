import * as SecureStore from 'expo-secure-store'
import { getApiBaseUrl } from './apiBase'

const USER_KEY = 'fulbito_auth_user'

export type AuthUser = {
  id: string
  name: string
  role: 'USER' | 'ADMIN'
}

export async function getStoredUser(): Promise<AuthUser | null> {
  try {
    const raw = await SecureStore.getItemAsync(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY)
}

/** Misma API que NextAuth (credentials): POST /api/auth/login → backend valida usuario. */
export async function loginWithCredentials(username: string, password: string): Promise<AuthUser> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  })

  const data = (await res.json().catch(() => ({}))) as { error?: string; id?: string; name?: string; role?: string }

  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Credenciales inválidas')
  }

  if (!data.id || !data.name || !data.role) {
    throw new Error('Respuesta inválida del servidor')
  }

  const user: AuthUser = {
    id: data.id,
    name: data.name,
    role: data.role === 'ADMIN' ? 'ADMIN' : 'USER',
  }

  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
  return user
}

/** Registro igual que la web: POST /api/auth/register */
export async function registerAccount(username: string, password: string): Promise<void> {
  const base = getApiBaseUrl()
  const res = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password }),
  })

  const data = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'No se pudo registrar')
  }
}

export async function logout(): Promise<void> {
  await clearSession()
}
