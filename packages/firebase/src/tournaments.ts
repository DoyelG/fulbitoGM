import {
  arrayRemove,
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  updateDoc,
  runTransaction,
  Timestamp,
  type DocumentReference,
  type Transaction,
} from 'firebase/firestore'
import type { MyTournament, Tournament, TournamentMember, TournamentRole } from '@fulbito/types'
import { toDate, toOptionalDate } from './dates'

export const TOURNAMENTS_COLLECTION = 'tournaments'
export const MEMBERS_COLLECTION = 'members'
export const PLAYER_LINKS_COLLECTION = 'playerLinks'
export const INVITATIONS_COLLECTION = 'invitations'

const MAX_NAME_LENGTH = 60
const MAX_DESCRIPTION_LENGTH = 280

const ROLE_ORDER: Record<TournamentRole, number> = { OWNER: 0, ADMIN: 1, MEMBER: 2 }

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined
}

export function docToTournament(id: string, data: Record<string, unknown>): Tournament {
  return {
    id,
    name: typeof data['name'] === 'string' ? data['name'] : '',
    description: optionalString(data['description']),
    photoUrl: optionalString(data['photoUrl']),
    ownerUid: typeof data['ownerUid'] === 'string' ? data['ownerUid'] : '',
    memberUids: Array.isArray(data['memberUids']) ? (data['memberUids'] as string[]) : [],
    deletedAt: toOptionalDate(data['deletedAt']),
    deletedBy: optionalString(data['deletedBy']),
    createdAt: toDate(data['createdAt']),
    updatedAt: toDate(data['updatedAt']),
  }
}

export function docToTournamentMember(
  tournamentId: string,
  uid: string,
  data: Record<string, unknown>,
): TournamentMember {
  return {
    uid,
    tournamentId,
    email: typeof data['email'] === 'string' ? data['email'] : '',
    role: (data['role'] as TournamentRole | undefined) ?? 'MEMBER',
    playerId: optionalString(data['playerId']) ?? null,
    joinedAt: toDate(data['joinedAt']),
    updatedAt: toDate(data['updatedAt']),
  }
}

function normalizeName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Tournament name is required')
  if (trimmed.length > MAX_NAME_LENGTH) throw new Error(`Tournament name must be at most ${MAX_NAME_LENGTH} characters`)
  return trimmed
}

function normalizeDescription(description: string | undefined): string | null {
  const trimmed = description?.trim()
  if (!trimmed) return null
  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Tournament description must be at most ${MAX_DESCRIPTION_LENGTH} characters`)
  }
  return trimmed
}

function tournamentRef(tournamentId: string) {
  return doc(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId)
}

function memberRef(tournamentId: string, uid: string) {
  return doc(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId, MEMBERS_COLLECTION, uid)
}

export function playerLinkRef(tournamentId: string, playerId: string) {
  return doc(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId, PLAYER_LINKS_COLLECTION, playerId)
}

export async function isPlayerLinked(tournamentId: string, playerId: string): Promise<boolean> {
  return (await getDoc(playerLinkRef(tournamentId, playerId))).exists()
}

type CreateTournamentInput = {
  name: string
  description?: string
  ownerUid: string
  ownerEmail: string
}

export async function createTournament(input: CreateTournamentInput): Promise<string> {
  const { name, description, ownerUid, ownerEmail } = input
  const db = getFirestore()
  const now = Timestamp.now()
  const newTournamentRef = doc(collection(db, TOURNAMENTS_COLLECTION))

  const batch = writeBatch(db)
  batch.set(newTournamentRef, {
    name: normalizeName(name),
    description: normalizeDescription(description),
    photoUrl: null,
    ownerUid,
    memberUids: [ownerUid],
    deletedAt: null,
    deletedBy: null,
    createdAt: now,
    updatedAt: now,
  })
  batch.set(memberRef(newTournamentRef.id, ownerUid), {
    uid: ownerUid,
    tournamentId: newTournamentRef.id,
    email: ownerEmail.trim().toLowerCase(),
    role: 'OWNER',
    playerId: null,
    joinedAt: now,
    updatedAt: now,
  })
  await batch.commit()

  return newTournamentRef.id
}

export async function getTournament(tournamentId: string): Promise<Tournament | null> {
  const snap = await getDoc(tournamentRef(tournamentId))
  if (!snap.exists()) return null
  const tournament = docToTournament(snap.id, snap.data())
  return tournament.deletedAt ? null : tournament
}

export async function getMyTournaments(uid: string): Promise<MyTournament[]> {
  const db = getFirestore()
  const snap = await getDocs(
    query(
      collection(db, TOURNAMENTS_COLLECTION),
      where('memberUids', 'array-contains', uid),
      where('deletedAt', '==', null),
    ),
  )
  const tournaments = snap.docs
    .map((tournamentDoc) => docToTournament(tournamentDoc.id, tournamentDoc.data()))
    .filter((tournament) => !tournament.deletedAt)

  const memberships = await Promise.all(tournaments.map((tournament) => getTournamentMember(tournament.id, uid)))

  return tournaments
    .flatMap((tournament, index) => {
      const membership = memberships[index]
      return membership ? [{ tournament, membership }] : []
    })
    .sort((a, b) => a.tournament.name.localeCompare(b.tournament.name))
}

type UpdateTournamentInput = Partial<Pick<Tournament, 'name' | 'description' | 'photoUrl'>>

export async function updateTournament(tournamentId: string, data: UpdateTournamentInput): Promise<void> {
  const changes: Record<string, unknown> = { updatedAt: Timestamp.now() }
  if (data.name !== undefined) changes['name'] = normalizeName(data.name)
  if (data.description !== undefined) changes['description'] = normalizeDescription(data.description)
  if (data.photoUrl !== undefined) changes['photoUrl'] = data.photoUrl || null
  await updateDoc(tournamentRef(tournamentId), changes)
}

export async function getPendingInvitationRefs(tournamentId: string, invitedBy?: string): Promise<DocumentReference[]> {
  const snap = await getDocs(
    query(
      collection(getFirestore(), INVITATIONS_COLLECTION),
      where('tournamentId', '==', tournamentId),
      where('status', '==', 'pending'),
    ),
  )
  return snap.docs
    .filter((invitation) => invitedBy === undefined || invitation.get('invitedBy') === invitedBy)
    .map((invitation) => invitation.ref)
}

export async function revokePendingInvitations(
  transaction: Transaction,
  invitationRefs: DocumentReference[],
  now: Timestamp,
): Promise<void> {
  const invitationSnaps = await Promise.all(invitationRefs.map((ref) => transaction.get(ref)))
  invitationSnaps
    .filter((invitation) => invitation.get('status') === 'pending')
    .forEach((invitation) => {
      transaction.update(invitation.ref, { status: 'revoked', resolvedAt: now, updatedAt: now })
    })
}

export async function deleteTournament(tournamentId: string, uid: string): Promise<void> {
  const db = getFirestore()
  const invitationRefs = await getPendingInvitationRefs(tournamentId)

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(tournamentRef(tournamentId))
    if (!snap.exists() || snap.get('deletedAt')) throw new Error('Tournament not found')
    if (snap.get('ownerUid') !== uid) throw new Error('Only the owner can delete the tournament')

    const now = Timestamp.now()
    await revokePendingInvitations(transaction, invitationRefs, now)
    transaction.update(snap.ref, { deletedAt: now, deletedBy: uid, updatedAt: now })
  })
}

export async function leaveTournament(tournamentId: string, uid: string): Promise<void> {
  const member = await getDoc(memberRef(tournamentId, uid))
  if (!member.exists()) throw new Error('Not a member of the tournament')
  if (member.get('role') === 'OWNER') throw new Error('The owner cannot leave the tournament')
  const invitationRefs = member.get('role') === 'ADMIN' ? await getPendingInvitationRefs(tournamentId, uid) : []

  await runTransaction(getFirestore(), async (transaction) => {
    const now = Timestamp.now()
    await revokePendingInvitations(transaction, invitationRefs, now)
    const playerId = member.get('playerId')
    if (playerId) transaction.delete(playerLinkRef(tournamentId, playerId))
    transaction.delete(member.ref)
    transaction.update(tournamentRef(tournamentId), { memberUids: arrayRemove(uid), updatedAt: now })
  })
}

export async function getTournamentMember(tournamentId: string, uid: string): Promise<TournamentMember | null> {
  const snap = await getDoc(memberRef(tournamentId, uid))
  return snap.exists() ? docToTournamentMember(tournamentId, snap.id, snap.data()) : null
}

export async function getTournamentMembers(tournamentId: string): Promise<TournamentMember[]> {
  const db = getFirestore()
  const snap = await getDocs(collection(db, TOURNAMENTS_COLLECTION, tournamentId, MEMBERS_COLLECTION))
  return snap.docs
    .map((member) => docToTournamentMember(tournamentId, member.id, member.data()))
    .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.email.localeCompare(b.email))
}
