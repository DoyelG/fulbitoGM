import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'

export function initFirebase(config: FirebaseOptions): FirebaseApp | undefined {
  if (!config.apiKey) return undefined
  const app = getApps()[0] ?? initializeApp(config)

  try {
    initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  } catch {
  }

  return app
}
