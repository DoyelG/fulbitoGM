import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'

export function initFirebase(config: FirebaseOptions): FirebaseApp | undefined {
  if (!config.apiKey) return undefined
  const app = getApps()[0] ?? initializeApp(config)

  // The default gRPC-Web streaming transport assumes a browser environment and fails
  // to reach the backend when this SDK runs inside a Node.js process (e.g. a Next.js
  // Server Component) — auto-detecting long-polling makes the same client code work
  // in both browser and Node contexts. Guarded with try/catch because Firestore can
  // only be configured once per app instance; a second call (e.g. Next.js dev-mode
  // hot reload re-evaluating this module) throws instead of being a no-op, and the
  // already-initialized instance already has this setting applied.
  try {
    initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  } catch {
    // already initialized — safe to ignore
  }

  return app
}
