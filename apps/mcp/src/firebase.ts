import { existsSync } from 'node:fs'
import { initFirebase, signIn } from '@fulbito/firebase'
import { errorResult, type ToolResult } from './tool-result'

let session: Promise<string> | null = null

async function connect(): Promise<string> {
  if (typeof process.loadEnvFile === 'function' && existsSync('.env')) process.loadEnvFile('.env')

  const { FIREBASE_API_KEY, FIREBASE_PROJECT_ID, FIREBASE_MCP_EMAIL, FIREBASE_MCP_PASSWORD } = process.env
  if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID || !FIREBASE_MCP_EMAIL || !FIREBASE_MCP_PASSWORD) {
    throw new Error('Firebase config missing — copy apps/mcp/.env.example to apps/mcp/.env and fill it in')
  }

  initFirebase({
    apiKey: FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  })

  try {
    const user = await signIn(FIREBASE_MCP_EMAIL, FIREBASE_MCP_PASSWORD)
    return user.uid
  } catch {
    throw new Error('Could not sign in with FIREBASE_MCP_EMAIL / FIREBASE_MCP_PASSWORD')
  }
}

function ensureSession(): Promise<string> {
  session ??= connect().catch((err: unknown) => {
    session = null
    throw err
  })
  return session
}

export function withFirebase<A extends unknown[]>(
  handler: (uid: string, ...args: A) => Promise<ToolResult>,
): (...args: A) => Promise<ToolResult> {
  return async (...args) => {
    let uid: string
    try {
      uid = await ensureSession()
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err))
    }
    return handler(uid, ...args)
  }
}
