import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'

export function initFirebase(config: FirebaseOptions): FirebaseApp | undefined {
  if (!config.apiKey) return undefined
  return getApps()[0] ?? initializeApp(config)
}
