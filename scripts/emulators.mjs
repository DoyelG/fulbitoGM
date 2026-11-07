import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'
import { AUTH_URL, FIRESTORE_URL, seedTestData, TEST_ACCOUNTS, TEST_PASSWORD } from './emulator-seed.mjs'

const FIREBASE_TOOLS = 'firebase-tools@15.32.0'
const DATA_DIR = '.firebase-emulator'
const STARTUP_TIMEOUT_MS = 180_000

const projectId = JSON.parse(readFileSync('.firebaserc', 'utf8')).projects.default

const emulators = spawn(
  'pnpm',
  ['dlx', FIREBASE_TOOLS, 'emulators:start', `--import=${DATA_DIR}`, `--export-on-exit=${DATA_DIR}`],
  { stdio: 'inherit' },
)
let emulatorsExited = false
emulators.on('exit', (code, signal) => {
  emulatorsExited = true
  process.exit(code ?? (signal ? 1 : 0))
})
// Ctrl+C already reaches the emulators, and a second SIGINT would make them quit without exporting.
process.on('SIGINT', () => {})
process.on('SIGTERM', () => emulators.kill('SIGTERM'))

async function isUp(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(1_000) })
    return true
  } catch {
    return false
  }
}

async function waitForEmulators() {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS
  while (Date.now() < deadline && !emulatorsExited) {
    if ((await isUp(AUTH_URL)) && (await isUp(FIRESTORE_URL))) return true
    await sleep(1_000)
  }
  return false
}

if (await waitForEmulators()) {
  try {
    const { createdTournament, court } = await seedTestData(projectId)
    const accounts = TEST_ACCOUNTS.map((account) => account.email).join(', ')
    const tournament = createdTournament ? 'created' : 'already there'
    process.stdout.write(
      `\n✔  Test accounts ready: ${accounts} (password ${TEST_PASSWORD}). Demo tournament ${tournament}, court "${court.name}".\n\n`,
    )
  } catch (error) {
    process.stderr.write(`\n⚠  Could not seed test data: ${error instanceof Error ? error.message : error}\n\n`)
  }
}
