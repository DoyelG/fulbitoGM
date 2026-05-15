/**
 * Migrates production data from Neon PostgreSQL to Firebase Firestore + Storage.
 *
 * Usage:
 *   NEON_DATABASE_URL="postgresql://..." SEED_EMAIL="..." SEED_PASSWORD="..." node scripts/migrate-neon-to-firebase.mjs
 *
 * Reads Firebase config from apps/web/.env.local
 * Preserves original Prisma CUIDs as Firestore document IDs.
 * Uploads base64 photo data URIs to Firebase Storage.
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc, Timestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Read .env.local
const envPath = path.join(__dirname, '../.env.local')
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    })
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
const storage = getStorage(app)
const auth = getAuth(app)

// Resolve Prisma client path
const prismaClientPath = path.resolve(
  __dirname,
  '../../../node_modules/.pnpm/@prisma+client@6.19.2_prisma@6.19.2_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client'
)
const { PrismaClient } = require(prismaClientPath)

async function clearCollection(name) {
  const snap = await getDocs(collection(db, name))
  if (snap.size === 0) return
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
  console.log(`  Cleared ${snap.size} existing docs from "${name}"`)
}

/** Upload a base64 data URI to Firebase Storage; returns the download URL or null. */
async function uploadDataUri(playerId, dataUri) {
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/)
  if (!match) return null
  const mimeType = match[1]
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg')
  const buffer = Buffer.from(match[2], 'base64')
  const storageRef = ref(storage, `players/${playerId}.${ext}`)
  await uploadBytes(storageRef, buffer, { contentType: mimeType })
  return getDownloadURL(storageRef)
}

async function resolvePhotoUrl(playerId, rawPhotoUrl) {
  if (!rawPhotoUrl) return null
  if (rawPhotoUrl.startsWith('data:')) {
    return uploadDataUri(playerId, rawPhotoUrl)
  }
  // Already a regular URL (Firebase Storage or other)
  return rawPhotoUrl
}

async function main() {
  const neonUrl = process.env.NEON_DATABASE_URL
  if (!neonUrl) {
    console.error('NEON_DATABASE_URL env var is required')
    process.exit(1)
  }

  const email = process.env.SEED_EMAIL
  const password = process.env.SEED_PASSWORD
  if (!email || !password) {
    console.error('SEED_EMAIL and SEED_PASSWORD are required')
    process.exit(1)
  }

  console.log('Signing in to Firebase...')
  await signInWithEmailAndPassword(auth, email, password)
  console.log(`Signed in as ${email}`)

  const prisma = new PrismaClient({ datasources: { db: { url: neonUrl } } })

  try {
    console.log('\nReading from Neon...')
    const [players, matches, matchPlayers] = await Promise.all([
      prisma.player.findMany(),
      prisma.match.findMany(),
      prisma.matchPlayer.findMany(),
    ])
    console.log(`  Players: ${players.length}, Matches: ${matches.length}, MatchPlayers: ${matchPlayers.length}`)

    // --- Players ---
    console.log('\nMigrating players (uploading photos to Storage)...')
    await clearCollection('players')
    for (const p of players) {
      process.stdout.write(`  ${p.name}... `)
      const photoUrl = await resolvePhotoUrl(p.id, p.photoUrl)
      await setDoc(doc(db, 'players', p.id), {
        name: p.name,
        position: p.position,
        skill: p.skill ?? null,
        skills: p.skills ?? null,
        photoUrl,
        shirtDutiesCount: p.shirtDutiesCount,
        createdAt: Timestamp.fromDate(new Date(p.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(p.updatedAt)),
      })
      console.log(photoUrl ? 'photo uploaded ✓' : '✓')
    }
    console.log(`  Done — ${players.length} players written`)

    // --- Matches ---
    console.log('\nMigrating matches...')
    await clearCollection('matches')
    for (const m of matches) {
      await setDoc(doc(db, 'matches', m.id), {
        date: Timestamp.fromDate(new Date(m.date)),
        type: m.type,
        name: m.name ?? null,
        teamAScore: m.teamAScore,
        teamBScore: m.teamBScore,
        shirtsResponsibleId: m.shirtsResponsibleId ?? null,
        createdAt: Timestamp.fromDate(new Date(m.createdAt)),
        updatedAt: Timestamp.fromDate(new Date(m.updatedAt)),
      })
      process.stdout.write('.')
    }
    console.log(`\n  ✓ ${matches.length} matches written`)

    // --- MatchPlayers ---
    console.log('\nMigrating match players...')
    await clearCollection('matchPlayers')
    for (const mp of matchPlayers) {
      await setDoc(doc(db, 'matchPlayers', mp.id), {
        matchId: mp.matchId,
        playerId: mp.playerId,
        team: mp.team,
        goals: mp.goals,
        performance: mp.performance,
      })
      process.stdout.write('.')
    }
    console.log(`\n  ✓ ${matchPlayers.length} match players written`)

    console.log('\nMigration complete.')
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
