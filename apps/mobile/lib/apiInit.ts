import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'
import { configureApi, configureAuth } from '@fulbito/state'

const TOKEN_KEY = 'fulbito_mobile_token'

function resolveBaseUrl(): string {
  const fromExpoExtra = Constants.expoConfig?.extra?.apiUrl
  if (typeof fromExpoExtra === 'string' && fromExpoExtra.length > 0) {
    return fromExpoExtra.replace(/\/$/, '')
  }
  const fromEnv = process.env.EXPO_PUBLIC_API_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return 'http://localhost:3000'
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
