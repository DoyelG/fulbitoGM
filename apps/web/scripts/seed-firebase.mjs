/**
 * Firebase seed script — populates Firestore with players from the original Prisma seed.
 * Uploads local player photos to Firebase Storage.
 *
 * Usage:
 *   node scripts/seed-firebase.mjs
 *
 * Reads Firebase config from apps/web/.env.local
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, Timestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read .env.local
const envPath = path.join(__dirname, '../.env.local')
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.split('=').map(s => s.trim()))
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

const PHOTOS_DIR = path.join(__dirname, '../public/players')

const players = [
  // Boca Juniors — Intercontinental 2000
  { name: 'Óscar Córdoba',       position: 'GK',     skill: 8.5, photo: 'oscar-cordoba.jpg',         skills: { physical: 8, technical: 4, tactical: 9, psychological: 7 } },
  { name: 'Hugo Ibarra',         position: 'DEF',    skill: 7.5, photo: null,                         skills: { physical: 8, technical: 6, tactical: 8, psychological: 7 } },
  { name: 'Jorge Bermúdez',      position: 'DEF',    skill: 8.0, photo: null,                         skills: { physical: 9, technical: 5, tactical: 9, psychological: 8 } },
  { name: 'Cristián Traverso',   position: 'DEF',    skill: 7.0, photo: null,                         skills: { physical: 8, technical: 5, tactical: 8, psychological: 7 } },
  { name: 'Aníbal Matellán',     position: 'DEF',    skill: 7.0, photo: null,                         skills: { physical: 8, technical: 5, tactical: 8, psychological: 7 } },
  { name: 'Sebastián Battaglia', position: 'MID',    skill: 8.0, photo: 'sebastian-battaglia.jpg',    skills: { physical: 8, technical: 7, tactical: 8, psychological: 8 } },
  { name: 'Mauricio Serna',      position: 'MID',    skill: 7.5, photo: 'mauricio-serna.jpg',         skills: { physical: 7, technical: 7, tactical: 7, psychological: 8 } },
  { name: 'José Basualdo',       position: 'MID',    skill: 7.0, photo: null,                         skills: { physical: 7, technical: 6, tactical: 7, psychological: 7 } },
  { name: 'Juan Román Riquelme', position: 'MID',    skill: 9.5, photo: 'juan-roman-riquelme.jpg',   skills: { physical: 6, technical: 10, tactical: 9, psychological: 9 } },
  { name: 'Marcelo Delgado',     position: 'FWD',    skill: 7.5, photo: null,                         skills: { physical: 7, technical: 7, tactical: 6, psychological: 7 } },
  { name: 'Martín Palermo',      position: 'FWD',    skill: 9.0, photo: 'martin-palermo.jpg',         skills: { physical: 8, technical: 8, tactical: 7, psychological: 9 } },
  // Resto
  { name: 'Ariel',    position: 'MID',  skill: 7.5, photo: null, skills: { physical: 7, technical: 8, tactical: 7, psychological: 8 } },
  { name: 'Lucas',    position: 'FWD',  skill: 8.0, photo: null, skills: { physical: 7, technical: 8, tactical: 6, psychological: 8 } },
  { name: 'Matías',   position: 'DEF',  skill: 7.0, photo: null, skills: { physical: 8, technical: 5, tactical: 8, psychological: 7 } },
  { name: 'Nicolás',  position: 'FWD',  skill: 6.5, photo: null, skills: { physical: 6, technical: 7, tactical: 6, psychological: 7 } },
  { name: 'Facundo',  position: 'MID',  skill: 7.0, photo: null, skills: { physical: 6, technical: 7, tactical: 7, psychological: 7 } },
  { name: 'Gonzalo',  position: 'DEF',  skill: 6.5, photo: null, skills: { physical: 8, technical: 5, tactical: 7, psychological: 7 } },
  { name: 'Tomás',    position: 'FWD',  skill: 8.5, photo: null, skills: { physical: 7, technical: 9, tactical: 7, psychological: 8 } },
  { name: 'Diego',    position: 'MID',  skill: 7.5, photo: null, skills: { physical: 6, technical: 8, tactical: 8, psychological: 8 } },
  { name: 'Ramiro',   position: 'GK',   skill: 7.0, photo: null, skills: { physical: 7, technical: 4, tactical: 8, psychological: 7 } },
]

async function uploadPhoto(filename) {
  const filePath = path.join(PHOTOS_DIR, filename)
  if (!fs.existsSync(filePath)) return null
  const buffer = fs.readFileSync(filePath)
  const storageRef = ref(storage, `players/${filename}`)
  const ext = filename.split('.').pop()
  await uploadBytes(storageRef, buffer, { contentType: `image/${ext}` })
  return getDownloadURL(storageRef)
}

async function clearCollection(name) {
  const snap = await getDocs(collection(db, name))
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
  console.log(`Cleared ${snap.size} docs from "${name}"`)
}

async function main() {
  // Auth required to write to Firestore (adjust if rules allow unauthenticated writes)
  const email = process.env.SEED_EMAIL
  const password = process.env.SEED_PASSWORD
  if (email && password) {
    await signInWithEmailAndPassword(auth, email, password)
    console.log(`Signed in as ${email}`)
  } else {
    console.log('No SEED_EMAIL/SEED_PASSWORD set — attempting unauthenticated write (requires open rules)')
  }

  await clearCollection('players')
  console.log(`Seeding ${players.length} players...`)

  for (const p of players) {
    let photoUrl = null
    if (p.photo) {
      process.stdout.write(`  Uploading ${p.photo}... `)
      photoUrl = await uploadPhoto(p.photo)
      console.log(photoUrl ? 'ok' : 'file not found')
    }

    await addDoc(collection(db, 'players'), {
      name: p.name,
      position: p.position,
      skill: p.skill,
      skills: p.skills,
      photoUrl,
      shirtDutiesCount: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log(`  ✓ ${p.name}`)
  }

  console.log(`\nDone — ${players.length} players created.`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
