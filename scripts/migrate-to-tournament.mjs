import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

const USAGE = `Moves the data that has no tournamentId into one tournament.

Usage:
  node scripts/migrate-to-tournament.mjs --name "Torneo GM2" --owner owner@mail.com [--admin admin@mail.com ...] [--apply] [--emulator]

  --name       Tournament name (created if --id does not exist yet)
  --id         Tournament document id (default: gm2)
  --owner      Email of the user that owns the tournament
  --admin      Email of a user that becomes ADMIN (repeatable). Every other user becomes MEMBER
  --project    Firebase project id (default: .firebaserc)
  --emulator   Target the local Firestore emulator instead of the real project
  --apply      Write the changes. Without it the script only prints what it would do

Against the real project it authenticates with \`gcloud auth print-access-token\` (or FIRESTORE_ACCESS_TOKEN).
That token bypasses the security rules, so it can write documents the rules would reject.
`

const TENANT_COLLECTIONS = ['players', 'matches', 'matchPlayers', 'videoClips', 'addresses']
const MAX_WRITES_PER_COMMIT = 400
const PAGE_SIZE = 300

const { values: args } = parseArgs({
  options: {
    name: { type: 'string' },
    id: { type: 'string', default: 'gm2' },
    owner: { type: 'string' },
    admin: { type: 'string', multiple: true, default: [] },
    project: { type: 'string' },
    emulator: { type: 'boolean', default: false },
    apply: { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
})

function out(line = '') {
  process.stdout.write(`${line}\n`)
}

function fail(message) {
  process.stderr.write(`\n✗ ${message}\n`)
  process.exit(1)
}

if (args.help || !args.name || !args.owner) {
  out(USAGE)
  process.exit(args.help ? 0 : 1)
}

const projectId = args.project ?? JSON.parse(readFileSync('.firebaserc', 'utf8')).projects.default
const baseUrl = args.emulator ? 'http://127.0.0.1:8181' : 'https://firestore.googleapis.com'
const root = `projects/${projectId}/databases/(default)/documents`
const token = args.emulator ? 'owner' : accessToken()
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

function accessToken() {
  if (process.env.FIRESTORE_ACCESS_TOKEN) return process.env.FIRESTORE_ACCESS_TOKEN
  try {
    return execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim()
  } catch {
    fail('Could not get an access token. Run `gcloud auth login` or set FIRESTORE_ACCESS_TOKEN.')
  }
}

function toValue(value) {
  if (value === null) return { nullValue: null }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } }
  if (typeof value === 'string') return { stringValue: value }
  return { mapValue: { fields: toFields(value) } }
}

function toFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toValue(value)]))
}

function stringField(doc, key) {
  return doc.fields?.[key]?.stringValue ?? null
}

function docId(doc) {
  return doc.name.split('/').pop()
}

async function request(path, init = {}) {
  const res = await fetch(`${baseUrl}/v1/${path}`, { ...init, headers })
  if (res.status === 404) return null
  if (!res.ok) fail(`${init.method ?? 'GET'} ${path}: ${res.status} ${await res.text()}`)
  return res.json()
}

async function listDocuments(collectionPath) {
  const docs = []
  let pageToken = ''
  do {
    const query = `pageSize=${PAGE_SIZE}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`
    const page = await request(`${root}/${collectionPath}?${query}`)
    docs.push(...(page?.documents ?? []))
    pageToken = page?.nextPageToken ?? ''
  } while (pageToken)
  return docs
}

async function commit(writes) {
  for (let start = 0; start < writes.length; start += MAX_WRITES_PER_COMMIT) {
    await request(`${root}:commit`, {
      method: 'POST',
      body: JSON.stringify({ writes: writes.slice(start, start + MAX_WRITES_PER_COMMIT) }),
    })
  }
}

function createWrite(path, data) {
  return { update: { name: `${root}/${path}`, fields: toFields(data) }, currentDocument: { exists: false } }
}

function patchWrite(path, data) {
  return {
    update: { name: `${root}/${path}`, fields: toFields(data) },
    updateMask: { fieldPaths: Object.keys(data) },
    currentDocument: { exists: true },
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function roleFor(email, ownerEmail, adminEmails) {
  if (email === ownerEmail) return 'OWNER'
  if (adminEmails.has(email)) return 'ADMIN'
  return 'MEMBER'
}

function pickPlayerIds(users, players) {
  const playerIds = new Set(players.map(docId))
  const playerByLinkedUser = new Map(
    players.flatMap((player) => {
      const uid = stringField(player, 'linkedUserId')
      return uid ? [[uid, docId(player)]] : []
    }),
  )
  const taken = new Set()
  const picked = new Map()
  for (const user of users) {
    const uid = docId(user)
    const linked = stringField(user, 'linkedPlayerId')
    const candidate = linked && playerIds.has(linked) ? linked : (playerByLinkedUser.get(uid) ?? null)
    if (candidate && !taken.has(candidate)) {
      taken.add(candidate)
      picked.set(uid, candidate)
    }
  }
  return picked
}

async function main() {
  const ownerEmail = normalizeEmail(args.owner)
  const adminEmails = new Set(args.admin.map(normalizeEmail))
  const tournamentId = args.id
  const now = new Date()

  out(`Project: ${projectId}${args.emulator ? ' (emulator)' : ''}`)
  out(`Mode: ${args.apply ? 'APPLY' : 'DRY RUN (nothing is written)'}`)
  out(`Tournament: "${args.name}" (tournaments/${tournamentId})\n`)

  const users = (await listDocuments('users')).filter((user) => stringField(user, 'email'))
  const usersByEmail = new Map(users.map((user) => [normalizeEmail(stringField(user, 'email')), user]))
  const owner = usersByEmail.get(ownerEmail)
  if (!owner) fail(`No user with email ${ownerEmail}. They must sign in once before the migration.`)
  for (const email of adminEmails) {
    if (!usersByEmail.has(email)) fail(`No user with email ${email}. They must sign in once before the migration.`)
  }

  const existingTournament = await request(`${root}/tournaments/${tournamentId}`)
  const existingMembers = existingTournament ? await listDocuments(`tournaments/${tournamentId}/members`) : []
  const existingMemberUids = new Set(existingMembers.map(docId))
  const existingLinks = existingTournament ? await listDocuments(`tournaments/${tournamentId}/playerLinks`) : []
  const linkedPlayerIds = new Set(existingLinks.map(docId))

  const players = await listDocuments('players')
  const playerByUid = pickPlayerIds(users, players)
  const writes = []

  if (!existingTournament) {
    writes.push(
      createWrite(`tournaments/${tournamentId}`, {
        name: args.name.trim(),
        description: null,
        photoUrl: null,
        ownerUid: docId(owner),
        memberUids: users.map(docId),
        deletedAt: null,
        deletedBy: null,
        createdAt: now,
        updatedAt: now,
      }),
    )
  } else {
    const memberUids = [...new Set([...existingMemberUids, ...users.map(docId)])]
    writes.push(patchWrite(`tournaments/${tournamentId}`, { memberUids, updatedAt: now }))
  }

  out('Members:')
  for (const user of users) {
    const uid = docId(user)
    const email = normalizeEmail(stringField(user, 'email'))
    if (existingMemberUids.has(uid)) {
      out(`  = ${email} (already a member)`)
      continue
    }
    const role = roleFor(email, ownerEmail, adminEmails)
    const candidate = playerByUid.get(uid) ?? null
    const playerId = candidate && !linkedPlayerIds.has(candidate) ? candidate : null
    out(`  + ${email} → ${role}${playerId ? `, player ${playerId}` : ''}`)
    writes.push(
      createWrite(`tournaments/${tournamentId}/members/${uid}`, {
        uid,
        tournamentId,
        email,
        role,
        playerId,
        joinedAt: now,
        updatedAt: now,
      }),
    )
    if (playerId) {
      linkedPlayerIds.add(playerId)
      writes.push(createWrite(`tournaments/${tournamentId}/playerLinks/${playerId}`, { uid }))
    }
  }

  out('\nDocuments without tournamentId:')
  for (const collectionName of TENANT_COLLECTIONS) {
    const docs = collectionName === 'players' ? players : await listDocuments(collectionName)
    const orphans = docs.filter((doc) => !stringField(doc, 'tournamentId'))
    out(`  ${collectionName}: ${orphans.length} of ${docs.length}`)
    for (const doc of orphans) {
      writes.push(patchWrite(`${collectionName}/${docId(doc)}`, { tournamentId }))
    }
  }

  if (!args.apply) {
    out(`\nDry run finished: ${writes.length} writes pending. Run again with --apply to write them.`)
    return
  }

  await commit(writes)
  out(`\n✔ Done: ${writes.length} writes.`)
}

await main()
