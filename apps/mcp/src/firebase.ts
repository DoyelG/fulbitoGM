import { existsSync } from 'node:fs'
import { initFirebase } from '@fulbito/firebase'
import { errorResult, type ToolResult } from './tool-result'

// Same public client config the web/mobile apps embed in their bundles — not a secret.
// Reads work unauthenticated because players/matches/matchPlayers allow public reads
// in firestore.rules; this server never signs in and never writes.
let checked = false
let configError: string | null = null

// Lazy so the server always connects and registers its tools: a startup throw
// only surfaces as "Connection closed" in MCP clients, while a tool-level error
// is shown to the model and the user with actionable instructions.
function ensureFirebase(): string | null {
  if (checked) return configError
  checked = true

  // Loaded in-process instead of via node's --env-file flags, which would pin
  // the whole server to Node 22.9+ and die with a cryptic "bad option" earlier.
  if (typeof process.loadEnvFile === 'function' && existsSync('.env')) process.loadEnvFile('.env')

  const { FIREBASE_API_KEY, FIREBASE_PROJECT_ID } = process.env
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID) {
    configError = 'Firebase config missing — copy apps/mcp/.env.example to apps/mcp/.env and fill it in'
    return configError
  }

  initFirebase({
    apiKey: FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  })
  return null
}

export function withFirebase<A extends unknown[]>(
  handler: (...args: A) => Promise<ToolResult>,
): (...args: A) => Promise<ToolResult> {
  return async (...args) => {
    const error = ensureFirebase()
    return error ? errorResult(error) : handler(...args)
  }
}
