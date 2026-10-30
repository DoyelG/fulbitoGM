import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, initializeFirestore } from 'firebase/firestore'
import {
  connectFirestoreEmulator as connectLiteFirestoreEmulator,
  getFirestore as getLiteFirestore,
} from 'firebase/firestore/lite'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

const EMULATOR_PORTS = { auth: 9099, firestore: 8181, storage: 9199 } as const

export type InitFirebaseOptions = {
  emulatorHost?: string
}

function connectEmulators(app: FirebaseApp, host: string): void {
  const auth = getAuth(app)
  if (auth.emulatorConfig) return

  connectAuthEmulator(auth, `http://${host}:${EMULATOR_PORTS.auth}`, { disableWarnings: true })
  connectFirestoreEmulator(getFirestore(app), host, EMULATOR_PORTS.firestore)
  connectLiteFirestoreEmulator(getLiteFirestore(app), host, EMULATOR_PORTS.firestore)
  connectStorageEmulator(getStorage(app), host, EMULATOR_PORTS.storage)
}

export function initFirebase(config: FirebaseOptions, options: InitFirebaseOptions = {}): FirebaseApp | undefined {
  if (!config.apiKey) return undefined
  const app = getApps()[0] ?? initializeApp(config)

  try {
    initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
  } catch {}

  if (options.emulatorHost) connectEmulators(app, options.emulatorHost)

  return app
}
