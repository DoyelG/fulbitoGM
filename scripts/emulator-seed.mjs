export const AUTH_URL = 'http://127.0.0.1:9099'
export const FIRESTORE_URL = 'http://127.0.0.1:8181'
const ADMIN_HEADERS = { 'Content-Type': 'application/json', Authorization: 'Bearer owner' }

export const TEST_PASSWORD = '123456'
export const TEST_ACCOUNTS = [
  { uid: 'test-user-1', email: 'test@test.com' },
  { uid: 'test-user-2', email: 'test2@test.com' },
]

const DEMO_TOURNAMENT_ID = 'demo-tournament'
const DEMO_PLAYERS = [
  ['Martín Gómez', 'GK'],
  ['Lucas Fernández', 'GK'],
  ['Diego Romero', 'DEF'],
  ['Nicolás Díaz', 'DEF'],
  ['Matías Álvarez', 'DEF'],
  ['Federico Torres', 'DEF'],
  ['Santiago Ruiz', 'DEF'],
  ['Joaquín Sosa', 'DEF'],
  ['Tomás Benítez', 'MID'],
  ['Facundo Medina', 'MID'],
  ['Agustín Herrera', 'MID'],
  ['Ignacio Castro', 'MID'],
  ['Franco Morales', 'MID'],
  ['Bruno Suárez', 'MID'],
  ['Gonzalo Pereyra', 'FWD'],
  ['Emiliano Rojas', 'FWD'],
  ['Julián Acosta', 'FWD'],
  ['Ezequiel Molina', 'FWD'],
  ['Leandro Ortiz', 'FWD'],
  ['Pablo Giménez', 'FWD'],
]
const DEMO_SCORES = [
  [5, 3],
  [2, 2],
  [4, 6],
  [7, 5],
  [3, 1],
]
const DEMO_COURT_ID = 'demo-court'
const COURT_NAMES = ['El Potrero', 'La Canchita', 'Complejo Los Pinos', 'Club Social Norte', 'Fútbol 5 La Esquina']
const COURT_STREETS = ['Av. Corrientes', 'Av. San Martín', 'Belgrano', 'Mitre', 'Av. Rivadavia', 'Sarmiento']
const PLAYERS_PER_TEAM = 5
const MATCH_HOUR_UTC = 21
const DAY_MS = 86_400_000

export async function seedTestData(projectId) {
  const uids = []
  for (const account of TEST_ACCOUNTS) {
    const uid = await ensureAccount(projectId, account)
    await ensureUserDoc(projectId, uid, account.email)
    uids.push(uid)
  }
  const court = await ensureDemoCourt(projectId)
  const createdTournament = await ensureDemoTournament(projectId, uids[0], TEST_ACCOUNTS[0].email, court)
  return { createdTournament, court }
}

async function authAdminRequest(projectId, path, body) {
  const res = await fetch(`${AUTH_URL}/identitytoolkit.googleapis.com/v1/projects/${projectId}/${path}`, {
    method: 'POST',
    headers: ADMIN_HEADERS,
    body: JSON.stringify(body),
  })
  return { ok: res.ok, data: await res.json() }
}

async function ensureAccount(projectId, { uid, email }) {
  const created = await authAdminRequest(projectId, 'accounts', {
    localId: uid,
    email,
    password: TEST_PASSWORD,
    emailVerified: true,
  })
  if (created.ok) return uid

  const { data } = await authAdminRequest(projectId, 'accounts:lookup', { email: [email] })
  const existingUid = data.users?.[0]?.localId
  if (!existingUid) throw new Error(`${email}: ${created.data.error?.message ?? 'could not create account'}`)
  await authAdminRequest(projectId, 'accounts:update', {
    localId: existingUid,
    password: TEST_PASSWORD,
    emailVerified: true,
  })
  return existingUid
}

function documentsUrl(projectId) {
  return `${FIRESTORE_URL}/v1/projects/${projectId}/databases/(default)/documents`
}

function toValue(value) {
  if (value === null) return { nullValue: null }
  if (value instanceof Date) return { timestampValue: value.toISOString() }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } }
  if (typeof value === 'boolean') return { booleanValue: value }
  if (typeof value === 'number')
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  if (typeof value === 'string') return { stringValue: value }
  return { mapValue: { fields: toFields(value) } }
}

function toFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toValue(value)]))
}

async function commitNewDocs(projectId, docs) {
  const root = `projects/${projectId}/databases/(default)/documents`
  const res = await fetch(`${documentsUrl(projectId)}:commit`, {
    method: 'POST',
    headers: ADMIN_HEADERS,
    body: JSON.stringify({
      writes: docs.map(({ path, data }) => ({
        update: { name: `${root}/${path}`, fields: toFields(data) },
        currentDocument: { exists: false },
      })),
    }),
  })
  if (!res.ok) throw new Error(`commit: ${res.status} ${await res.text()}`)
}

async function readDocFields(projectId, path) {
  const res = await fetch(`${documentsUrl(projectId)}/${path}`, { headers: ADMIN_HEADERS })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`)
  return (await res.json()).fields ?? {}
}

async function docExists(projectId, path) {
  return (await readDocFields(projectId, path)) !== null
}

async function ensureUserDoc(projectId, uid, email) {
  if (await docExists(projectId, `users/${uid}`)) return
  const now = new Date()
  await commitNewDocs(projectId, [
    { path: `users/${uid}`, data: { email, role: ['USER'], createdAt: now, updatedAt: now } },
  ])
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)]
}

async function ensureDemoCourt(projectId) {
  const existing = await readDocFields(projectId, `addresses/${DEMO_COURT_ID}`)
  if (existing) {
    return {
      name: existing.name?.stringValue ?? '',
      street: existing.street?.stringValue ?? '',
      addressId: DEMO_COURT_ID,
    }
  }

  const name = pickRandom(COURT_NAMES)
  const street = `${pickRandom(COURT_STREETS)} ${100 + Math.floor(Math.random() * 4900)}`
  const now = new Date()
  await commitNewDocs(projectId, [
    {
      path: `addresses/${DEMO_COURT_ID}`,
      data: { tournamentId: DEMO_TOURNAMENT_ID, name, street, createdAt: now, updatedAt: now },
    },
  ])
  return { name, street, addressId: DEMO_COURT_ID }
}

function seededRandom(seed) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

function demoPlayers(now, random) {
  const between = (min, max) => min + Math.floor(random() * (max - min + 1))
  return DEMO_PLAYERS.map(([name, position], index) => {
    const skills = {
      physical: between(4, 9),
      technical: between(4, 9),
      tactical: between(4, 9),
      psychological: between(4, 9),
    }
    const total = skills.physical + skills.technical + skills.tactical + skills.psychological
    return {
      id: `demo-player-${String(index + 1).padStart(2, '0')}`,
      position,
      data: {
        tournamentId: DEMO_TOURNAMENT_ID,
        name,
        position,
        skill: Math.round((total / 4) * 10) / 10,
        skills,
        photoUrl: null,
        goalkeeping: position === 'GK' ? between(7, 9) : between(2, 5),
        inactive: false,
        createdAt: now,
        updatedAt: now,
      },
    }
  })
}

function spreadGoals(goals, team, random) {
  const shooters = team.slice(1)
  const tally = new Map(team.map((player) => [player.id, 0]))
  for (let i = 0; i < goals; i++) {
    const shooter = shooters[Math.floor(random() * shooters.length)]
    tally.set(shooter.id, tally.get(shooter.id) + 1)
  }
  return tally
}

function demoMatches(players, now, random, court) {
  const keepers = players.filter((player) => player.position === 'GK')
  const fielders = players.filter((player) => player.position !== 'GK')
  const fieldersPerMatch = (PLAYERS_PER_TEAM - 1) * 2

  return DEMO_SCORES.flatMap(([teamAScore, teamBScore], matchIndex) => {
    const id = `demo-match-${matchIndex + 1}`
    const weeksAgo = DEMO_SCORES.length - matchIndex
    const day = new Date(now.getTime() - weeksAgo * 7 * DAY_MS)
    const date = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), MATCH_HOUR_UTC))
    const picked = Array.from({ length: fieldersPerMatch }, (_, i) => fielders[(matchIndex * 4 + i) % fielders.length])
    const teamA = [keepers[0], ...picked.filter((_, i) => i % 2 === 0)]
    const teamB = [keepers[1], ...picked.filter((_, i) => i % 2 === 1)]
    const goals = new Map([...spreadGoals(teamAScore, teamA, random), ...spreadGoals(teamBScore, teamB, random)])
    const winners = teamBScore > teamAScore ? teamB : teamA
    const mvp = winners.reduce((best, player) => (goals.get(player.id) > goals.get(best.id) ? player : best))

    const rows = [
      ...teamA.map((player) => ({ player, team: 'A' })),
      ...teamB.map((player) => ({ player, team: 'B' })),
    ].map(({ player, team }) => ({
      path: `matchPlayers/${id}-${player.id}`,
      data: {
        tournamentId: DEMO_TOURNAMENT_ID,
        matchId: id,
        playerId: player.id,
        team,
        goals: goals.get(player.id),
        performance: player === mvp ? 9 : 5 + Math.floor(random() * 4),
      },
    }))

    return [
      {
        path: `matches/${id}`,
        data: {
          tournamentId: DEMO_TOURNAMENT_ID,
          date,
          hasTime: true,
          type: `${PLAYERS_PER_TEAM}v${PLAYERS_PER_TEAM}`,
          status: 'final',
          teamAScore,
          teamBScore,
          name: null,
          description: null,
          location: court,
          shirtsResponsibleId: picked[matchIndex % picked.length].id,
          mvpId: mvp.id,
          goalkeeperIds: [keepers[0].id, keepers[1].id],
          isFriendly: false,
          createdAt: date,
          updatedAt: date,
        },
      },
      ...rows,
    ]
  })
}

async function ensureDemoTournament(projectId, ownerUid, ownerEmail, court) {
  if (await docExists(projectId, `tournaments/${DEMO_TOURNAMENT_ID}`)) return false

  const now = new Date()
  const random = seededRandom(165)
  const players = demoPlayers(now, random)
  await commitNewDocs(projectId, [
    {
      path: `tournaments/${DEMO_TOURNAMENT_ID}`,
      data: {
        name: 'Torneo de prueba',
        description: 'Datos de ejemplo del emulador.',
        photoUrl: null,
        ownerUid,
        memberUids: [ownerUid],
        deletedAt: null,
        deletedBy: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    {
      path: `tournaments/${DEMO_TOURNAMENT_ID}/members/${ownerUid}`,
      data: {
        uid: ownerUid,
        tournamentId: DEMO_TOURNAMENT_ID,
        email: ownerEmail,
        role: 'OWNER',
        playerId: null,
        joinedAt: now,
        updatedAt: now,
      },
    },
    ...players.map((player) => ({ path: `players/${player.id}`, data: player.data })),
    ...demoMatches(players, now, random, court),
  ])
  return true
}
