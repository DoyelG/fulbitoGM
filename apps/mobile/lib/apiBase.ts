import Constants from 'expo-constants'
import { Platform } from 'react-native'

/**
 * Base del API (Next web con proxy a backend, o backend directo).
 * Misma convención que la web: rutas `/api/...`.
 */
export function getApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiUrl
  let url =
    typeof fromExtra === 'string' && fromExtra.length > 0
      ? fromExtra.replace(/\/$/, '')
      : (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  if (Platform.OS === 'android') {
    url = url
      .replace('http://localhost', 'http://10.0.2.2')
      .replace('http://127.0.0.1', 'http://10.0.2.2')
  }

  return url
}
