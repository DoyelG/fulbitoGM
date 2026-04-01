import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { configureApi, configureAuth } from '@fulbito/state'

const TOKEN_KEY = 'fulbito_mobile_token'

/**
 * En el emulador Android, `localhost` / `127.0.0.1` es el propio emulador, no tu PC.
 * `10.0.2.2` es el alias del host (donde corre Next.js). En iOS simulator y web, `localhost` va bien.
 * En dispositivo físico: usá la IP LAN de tu máquina en EXPO_PUBLIC_API_URL (o `adb reverse tcp:3000 tcp:3000` y localhost).
 */
export function normalizeApiBaseUrlForDevice(url: string): string {
  if (Platform.OS !== 'android') return url
  return url
    .replace('http://localhost', 'http://10.0.2.2')
    .replace('http://127.0.0.1', 'http://10.0.2.2')
    .replace('https://localhost', 'https://10.0.2.2')
    .replace('https://127.0.0.1', 'https://10.0.2.2')
}

function resolveBaseUrl(): string {
  const fromExpoExtra = Constants.expoConfig?.extra?.apiUrl
  if (typeof fromExpoExtra === 'string' && fromExpoExtra.length > 0) {
    return normalizeApiBaseUrlForDevice(fromExpoExtra.replace(/\/$/, ''))
  }
  const fromEnv = process.env.EXPO_PUBLIC_API_URL
  if (fromEnv) return normalizeApiBaseUrlForDevice(fromEnv.replace(/\/$/, ''))
  return normalizeApiBaseUrlForDevice('http://localhost:3000')
}

export function initFulbitoApi() {
  configureApi({ baseUrl: resolveBaseUrl() })
  configureAuth(async (): Promise<Record<string, string>> => {
    const t = await SecureStore.getItemAsync(TOKEN_KEY)
    if (!t) return {}
    return { Authorization: `Bearer ${t}` }
  })
}

export async function setMobileAuthToken(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  }
}

export async function getMobileAuthToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}
