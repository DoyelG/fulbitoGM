import {
  collection,
  deleteDoc,
  type DocumentSnapshot,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  setDoc,
  Timestamp,
  type Transaction,
  where,
} from 'firebase/firestore'
import type { TournamentPlayerRequest, TournamentRole } from '@fulbito/types'
import { toDate } from './dates'
import { PLAYERS_COLLECTION, playerNameExists } from './players'
import {
  isPlayerLinked,
  MEMBERS_COLLECTION,
  PLAYER_REQUESTS_COLLECTION,
  playerLinkRef,
  TOURNAMENTS_COLLECTION,
} from './tournaments'

export const NEW_PLAYER_NAME_MAX_LENGTH = 50

export class TournamentPlayerRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TournamentPlayerRequestError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined
}

function requestRef(tournamentId: string, uid: string) {
  return doc(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId, PLAYER_REQUESTS_COLLECTION, uid)
}

function memberRef(tournamentId: string, uid: string) {
  return doc(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId, MEMBERS_COLLECTION, uid)
}

export function docToTournamentPlayerRequest(
  tournamentId: string,
  uid: string,
  data: Record<string, unknown>,
): TournamentPlayerRequest {
  return {
    uid,
    tournamentId,
    email: typeof data['email'] === 'string' ? data['email'] : '',
    playerId: optionalString(data['playerId']),
    newPlayerName: optionalString(data['newPlayerName']),
    status: data['status'] === 'rejected' ? 'rejected' : 'pending',
    resolvedBy: optionalString(data['resolvedBy']),
    createdAt: toDate(data['createdAt']),
    updatedAt: toDate(data['updatedAt']),
  }
}

type CreateTournamentPlayerRequestInput = {
  tournamentId: string
  uid: string
  email: string
} & ({ playerId: string } | { newPlayerName: string })

export type LinkPlayerOutcome = 'linked' | 'requested'

type LinkTarget = { playerId: string; newPlayerName: null } | { playerId: null; newPlayerName: string }

function parseLinkTarget(input: CreateTournamentPlayerRequestInput): LinkTarget {
  const playerId = 'playerId' in input ? input.playerId : null
  const newPlayerName = 'newPlayerName' in input ? input.newPlayerName.trim() : null

  if (newPlayerName && newPlayerName.length > NEW_PLAYER_NAME_MAX_LENGTH) {
    throw new TournamentPlayerRequestError(`El nombre puede tener hasta ${NEW_PLAYER_NAME_MAX_LENGTH} caracteres`)
  }
  if (playerId) return { playerId, newPlayerName: null }
  if (newPlayerName) return { playerId: null, newPlayerName }
  throw new TournamentPlayerRequestError('Elegí un jugador o escribí un nombre')
}

const ORGANIZER_ROLES: unknown[] = ['OWNER', 'ADMIN'] satisfies TournamentRole[]

async function assertLinkTargetAvailable(tournamentId: string, target: LinkTarget): Promise<void> {
  if (target.playerId && (await isPlayerLinked(tournamentId, target.playerId))) {
    throw new TournamentPlayerRequestError('Ese jugador ya está vinculado a otro miembro del torneo')
  }
  if (target.newPlayerName && (await playerNameExists(tournamentId, target.newPlayerName))) {
    throw new TournamentPlayerRequestError('Ya existe un jugador con ese nombre')
  }
}

async function linkMemberInTransaction(
  transaction: Transaction,
  tournamentId: string,
  memberSnap: DocumentSnapshot,
  target: LinkTarget,
  now: Timestamp,
): Promise<void> {
  const db = getFirestore()
  let playerId = target.playerId
  if (playerId) {
    const [playerSnap, linkSnap] = await Promise.all([
      transaction.get(doc(db, PLAYERS_COLLECTION, playerId)),
      transaction.get(playerLinkRef(tournamentId, playerId)),
    ])
    if (!playerSnap.exists() || playerSnap.get('tournamentId') !== tournamentId) {
      throw new TournamentPlayerRequestError('No se encontró el jugador')
    }
    if (linkSnap.exists()) {
      throw new TournamentPlayerRequestError('Ese jugador ya está vinculado a otro miembro del torneo')
    }
  } else {
    const newPlayerRef = doc(collection(db, PLAYERS_COLLECTION))
    transaction.set(newPlayerRef, {
      tournamentId,
      name: target.newPlayerName,
      position: '',
      skill: null,
      skills: null,
      photoUrl: null,
      goalkeeping: null,
      inactive: false,
      createdAt: now,
      updatedAt: now,
    })
    playerId = newPlayerRef.id
  }

  transaction.set(playerLinkRef(tournamentId, playerId), { uid: memberSnap.id })
  transaction.update(memberSnap.ref, { playerId, updatedAt: now })
}

export async function createTournamentPlayerRequest(input: CreateTournamentPlayerRequestInput): Promise<void> {
  const { tournamentId, uid } = input
  const target = parseLinkTarget(input)
  const { playerId, newPlayerName } = target

  const member = await getDoc(memberRef(tournamentId, uid))
  if (!member.exists()) throw new TournamentPlayerRequestError('No sos miembro de este torneo')
  if (member.get('playerId')) throw new TournamentPlayerRequestError('Ya tenés un jugador en este torneo')

  const existing = await getDoc(requestRef(tournamentId, uid))
  if (existing.exists() && existing.get('status') === 'pending') {
    throw new TournamentPlayerRequestError('Ya tenés una solicitud pendiente')
  }

  await assertLinkTargetAvailable(tournamentId, target)

  if (existing.exists()) await deleteDoc(existing.ref)

  const now = Timestamp.now()
  await setDoc(requestRef(tournamentId, uid), {
    uid,
    tournamentId,
    email: input.email.trim().toLowerCase(),
    playerId,
    newPlayerName,
    status: 'pending',
    resolvedBy: null,
    createdAt: now,
    updatedAt: now,
  })
}

export async function linkOrRequestTournamentPlayer(
  input: CreateTournamentPlayerRequestInput,
): Promise<LinkPlayerOutcome> {
  const { tournamentId, uid } = input
  const target = parseLinkTarget(input)
  const member = await getDoc(memberRef(tournamentId, uid))
  if (!member.exists()) throw new TournamentPlayerRequestError('No sos miembro de este torneo')
  if (!ORGANIZER_ROLES.includes(member.get('role'))) {
    await createTournamentPlayerRequest(input)
    return 'requested'
  }

  await assertLinkTargetAvailable(tournamentId, target)
  await runTransaction(getFirestore(), async (transaction) => {
    const [memberSnap, requestSnap] = await Promise.all([
      transaction.get(memberRef(tournamentId, uid)),
      transaction.get(requestRef(tournamentId, uid)),
    ])
    if (!memberSnap.exists()) throw new TournamentPlayerRequestError('No sos miembro de este torneo')
    if (memberSnap.get('playerId')) throw new TournamentPlayerRequestError('Ya tenés un jugador en este torneo')

    await linkMemberInTransaction(transaction, tournamentId, memberSnap, target, Timestamp.now())
    if (requestSnap.exists()) transaction.delete(requestSnap.ref)
  })
  return 'linked'
}

export async function getMyTournamentPlayerRequest(
  tournamentId: string,
  uid: string,
): Promise<TournamentPlayerRequest | null> {
  const snap = await getDoc(requestRef(tournamentId, uid))
  return snap.exists() ? docToTournamentPlayerRequest(tournamentId, snap.id, snap.data()) : null
}

export async function getPendingTournamentPlayerRequests(tournamentId: string): Promise<TournamentPlayerRequest[]> {
  const snap = await getDocs(
    query(
      collection(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId, PLAYER_REQUESTS_COLLECTION),
      where('status', '==', 'pending'),
    ),
  )
  return snap.docs
    .map((request) => docToTournamentPlayerRequest(tournamentId, request.id, request.data()))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

export async function cancelTournamentPlayerRequest(tournamentId: string, uid: string): Promise<void> {
  const snap = await getDoc(requestRef(tournamentId, uid))
  if (!snap.exists()) throw new TournamentPlayerRequestError('No se encontró la solicitud')
  if (snap.get('status') !== 'pending') throw new TournamentPlayerRequestError('Esta solicitud ya fue resuelta')
  await deleteDoc(snap.ref)
}

export async function resolveTournamentPlayerRequest(
  tournamentId: string,
  uid: string,
  action: 'accepted' | 'rejected',
  adminUid: string,
): Promise<void> {
  const db = getFirestore()
  const request = await getMyTournamentPlayerRequest(tournamentId, uid)
  if (!request || request.status !== 'pending') throw new TournamentPlayerRequestError('Esta solicitud ya fue resuelta')

  const target: LinkTarget = request.playerId
    ? { playerId: request.playerId, newPlayerName: null }
    : { playerId: null, newPlayerName: request.newPlayerName ?? '' }
  if (action === 'accepted') await assertLinkTargetAvailable(tournamentId, target)

  await runTransaction(db, async (transaction) => {
    const requestSnap = await transaction.get(requestRef(tournamentId, uid))
    if (requestSnap.get('status') !== 'pending')
      throw new TournamentPlayerRequestError('Esta solicitud ya fue resuelta')

    const now = Timestamp.now()
    if (action === 'rejected') {
      transaction.update(requestSnap.ref, { status: 'rejected', resolvedBy: adminUid, updatedAt: now })
      return
    }

    const memberSnap = await transaction.get(memberRef(tournamentId, uid))
    if (!memberSnap.exists()) throw new TournamentPlayerRequestError('El usuario ya no es miembro del torneo')
    if (memberSnap.get('playerId'))
      throw new TournamentPlayerRequestError('El usuario ya tiene un jugador en este torneo')

    await linkMemberInTransaction(transaction, tournamentId, memberSnap, target, now)
    transaction.delete(requestSnap.ref)
  })
}
