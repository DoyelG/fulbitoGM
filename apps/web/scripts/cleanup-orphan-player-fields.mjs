/**
 * Firestore cleanup — removes legacy fields from `players/{id}` documents
 * that are no longer part of the Player model. These fields used to be
 * stored per player but are now derived from matches:
 *
 *   - shirtDutiesCount  (removed in commit a2138b3 — derived from matches.shirtsResponsibleId)
 *   - mvpCount          (removed in commit e9a7304 — derived from matches.mvpId)
 *
 * Usage:
 *   node scripts/cleanup-orphan-player-fields.mjs           # dry run (default — no writes)
 *   node scripts/cleanup-orphan-player-fields.mjs --apply   # actually delete the fields
 *
 * Reads Firebase config from apps/web/.env.local.
 * Optional auth via SEED_EMAIL / SEED_PASSWORD env vars (only needed if
 * Firestore rules require an authenticated writer).
 *
 * Notes:
 *   - Skips documents that don't have either field — avoids unnecessary writes.
 *   - Does NOT bump `updatedAt`: this is a schema cleanup, not a player edit.
 *   - Uses `deleteField()` so the fields are removed from the document, not
 *     just set to null.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, updateDoc, deleteField } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ORPHAN_FIELDS = ['shirtDutiesCount', 'mvpCount']

const envPath = path.join(__dirname, '../.env.local')
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim())),
)

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

const APPLY = process.argv.includes('--apply')

async function main() {
  const email = process.env.SEED_EMAIL
  const password = process.env.SEED_PASSWORD
  if (email && password) {
    await signInWithEmailAndPassword(auth, email, password)
    console.log(`Signed in as ${email}`)
  } else {
    console.log('No SEED_EMAIL/SEED_PASSWORD set — relying on Firestore rules to allow the write.')
  }

  console.log(`\nMode: ${APPLY ? 'APPLY (will write)' : 'DRY RUN (no writes)'}`)
  console.log(`Target collection: players`)
  console.log(`Orphan fields: ${ORPHAN_FIELDS.join(', ')}\n`)

  const snap = await getDocs(collection(db, 'players'))
  console.log(`Scanned ${snap.size} player documents.`)

  const toClean = []
  for (const doc of snap.docs) {
    const data = doc.data()
    const fieldsPresent = ORPHAN_FIELDS.filter(f => Object.prototype.hasOwnProperty.call(data, f))
    if (fieldsPresent.length > 0) {
      toClean.push({ id: doc.id, name: data.name, ref: doc.ref, fieldsPresent })
    }
  }

  if (toClean.length === 0) {
    console.log('\nNothing to clean — no documents carry orphan fields.')
    process.exit(0)
  }

  console.log(`\nWould clean ${toClean.length} document(s):`)
  for (const t of toClean) {
    console.log(`  - ${t.id} (${t.name ?? 'unnamed'}) → remove [${t.fieldsPresent.join(', ')}]`)
  }

  if (!APPLY) {
    console.log('\nDry run finished. Re-run with --apply to perform the writes.')
    process.exit(0)
  }

  console.log('\nApplying writes...')
  let succeeded = 0
  let failed = 0
  for (const t of toClean) {
    const update = Object.fromEntries(t.fieldsPresent.map(f => [f, deleteField()]))
    try {
      await updateDoc(t.ref, update)
      succeeded++
      console.log(`  ✓ ${t.id}`)
    } catch (e) {
      failed++
      console.error(`  ✗ ${t.id} — ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  console.log(`\nDone. ${succeeded} succeeded, ${failed} failed.`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
