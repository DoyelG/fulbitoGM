import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  runTransaction,
  Timestamp,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import type { Player } from '@fulbito/types'
import {
  INVITATIONS_COLLECTION,
  MEMBERS_COLLECTION,
  PLAYER_REQUESTS_COLLECTION,
  playerLinkRef,
  revokePendingInvitations,
  TOURNAMENTS_COLLECTION,
} from './tournaments'

function isTimestampLike(value: unknown): value is { toDate(): Date } {
  return typeof value === 'object' && value !== null && typeof (value as { toDate?: unknown }).toDate === 'function'
}

function toDate(value: unknown): Date {
  if (isTimestampLike(value)) return value.toDate()
  const parsed = new Date(value as string)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

export const PLAYERS_COLLECTION = 'players'

export type PlayerInput = Omit<Player, 'id' | 'tournamentId' | 'createdAt' | 'updatedAt'>

export function docToPlayer(id: string, data: Record<string, unknown>): Player {
  return {
    id,
    tournamentId: typeof data['tournamentId'] === 'string' ? data['tournamentId'] : '',
    name: typeof data['name'] === 'string' ? data['name'] : '',
    position: typeof data['position'] === 'string' ? data['position'] : '',
    skill: (data['skill'] as number | null) ?? null,
    skills: (data['skills'] as Player['skills'] | null) ?? undefined,
    photoUrl: (data['photoUrl'] as string | null) ?? undefined,
    inactive: (data['inactive'] as boolean | null) ?? false,
    goalkeeping: (data['goalkeeping'] as number | null) ?? undefined,
    linkedUserId: (data['linkedUserId'] as string | null) ?? undefined,
    createdAt: toDate(data['createdAt']),
    updatedAt: toDate(data['updatedAt']),
  }
}

export function tournamentPlayersQuery(tournamentId: string) {
  return query(collection(getFirestore(), PLAYERS_COLLECTION), where('tournamentId', '==', tournamentId))
}

export async function getPlayers(tournamentId: string): Promise<Player[]> {
  const snap = await getDocs(tournamentPlayersQuery(tournamentId))
  return snap.docs
    .map((d) => docToPlayer(d.id, d.data()))
    .sort((a, b) => (b.skill ?? -Infinity) - (a.skill ?? -Infinity))
}

export async function getPlayer(id: string): Promise<Player | null> {
  const db = getFirestore()
  const snap = await getDoc(doc(db, PLAYERS_COLLECTION, id))
  return snap.exists() ? docToPlayer(snap.id, snap.data()) : null
}

export async function getPlayersByIds(ids: string[]): Promise<Player[]> {
  const results = await Promise.allSettled([...new Set(ids)].map((id) => getPlayer(id)))
  return results.flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []))
}

export async function playerNameExists(tournamentId: string, name: string): Promise<boolean> {
  const snap = await getDocs(tournamentPlayersQuery(tournamentId))
  const normalizedName = name.trim().toLowerCase()
  return snap.docs.some((playerDoc) => playerDoc.get('name')?.trim().toLowerCase() === normalizedName)
}

export async function createPlayer(tournamentId: string, data: PlayerInput): Promise<string> {
  if (!data.name.trim()) throw new Error('Player name is required')
  const db = getFirestore()
  const ref = await addDoc(collection(db, PLAYERS_COLLECTION), {
    tournamentId,
    name: data.name,
    position: data.position,
    skill: data.skill ?? null,
    skills: data.skills ?? null,
    photoUrl: data.photoUrl ?? null,
    goalkeeping: data.goalkeeping ?? null,
    inactive: data.inactive ?? false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return ref.id
}

export async function updatePlayer(id: string, data: Partial<PlayerInput>): Promise<void> {
  const db = getFirestore()
  await updateDoc(doc(db, PLAYERS_COLLECTION, id), { ...data, updatedAt: Timestamp.now() })
}

async function getPendingRefsForPlayer(tournamentId: string, playerId: string) {
  const db = getFirestore()
  const [invitations, requests] = await Promise.all([
    getDocs(
      query(
        collection(db, INVITATIONS_COLLECTION),
        where('tournamentId', '==', tournamentId),
        where('status', '==', 'pending'),
        where('playerId', '==', playerId),
      ),
    ),
    getDocs(
      query(
        collection(db, TOURNAMENTS_COLLECTION, tournamentId, PLAYER_REQUESTS_COLLECTION),
        where('status', '==', 'pending'),
        where('playerId', '==', playerId),
      ),
    ),
  ])
  return {
    invitationRefs: invitations.docs.map((invitation) => invitation.ref),
    requestRefs: requests.docs.map((request) => request.ref),
  }
}

export async function deletePlayer(id: string): Promise<void> {
  const db = getFirestore()
  const player = await getPlayer(id)
  if (!player) return
  const { tournamentId } = player
  const { invitationRefs, requestRefs } = await getPendingRefsForPlayer(tournamentId, id)
  const actorUid = getAuth().currentUser?.uid

  await runTransaction(db, async (transaction) => {
    const playerSnap = await transaction.get(doc(db, PLAYERS_COLLECTION, id))
    if (!playerSnap.exists()) return
    const linkSnap = await transaction.get(playerLinkRef(tournamentId, id))
    const linkedUid: string | null = linkSnap.exists() ? linkSnap.get('uid') : null
    const memberSnap = linkedUid
      ? await transaction.get(doc(db, TOURNAMENTS_COLLECTION, tournamentId, MEMBERS_COLLECTION, linkedUid))
      : null
    const requestSnaps = await Promise.all(requestRefs.map((ref) => transaction.get(ref)))

    const now = Timestamp.now()
    await revokePendingInvitations(transaction, invitationRefs, now)
    requestSnaps
      .filter((request) => actorUid && request.get('status') === 'pending' && request.get('playerId') === id)
      .forEach((request) => {
        transaction.update(request.ref, { status: 'rejected', resolvedBy: actorUid, updatedAt: now })
      })
    if (memberSnap?.exists() && memberSnap.get('playerId') === id) {
      transaction.update(memberSnap.ref, { playerId: null, updatedAt: now })
    }
    if (linkSnap.exists()) transaction.delete(linkSnap.ref)
    transaction.delete(playerSnap.ref)
  })
}
