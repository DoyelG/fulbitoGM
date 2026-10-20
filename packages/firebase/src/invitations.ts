import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  runTransaction,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import type { Invitation, InvitationRole, InvitationStatus } from '@fulbito/types'
import { toDate, toOptionalDate } from './dates'
import { MEMBERS_COLLECTION, TOURNAMENTS_COLLECTION, getTournament, getTournamentMembers } from './tournaments'

const INVITATIONS_COLLECTION = 'invitations'
const PLAYERS_COLLECTION = 'players'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(normalized)) throw new Error('Enter a valid email')
  return normalized
}

export function docToInvitation(id: string, data: Record<string, unknown>): Invitation {
  return {
    id,
    tournamentId: typeof data['tournamentId'] === 'string' ? data['tournamentId'] : '',
    tournamentName: typeof data['tournamentName'] === 'string' ? data['tournamentName'] : '',
    email: typeof data['email'] === 'string' ? data['email'] : '',
    role: (data['role'] as InvitationRole | undefined) ?? 'MEMBER',
    playerId: typeof data['playerId'] === 'string' && data['playerId'] ? data['playerId'] : undefined,
    invitedBy: typeof data['invitedBy'] === 'string' ? data['invitedBy'] : '',
    status: (data['status'] as InvitationStatus | undefined) ?? 'pending',
    resolvedAt: toOptionalDate(data['resolvedAt']),
    createdAt: toDate(data['createdAt']),
    updatedAt: toDate(data['updatedAt']),
  }
}

async function getPendingInvitations(field: 'tournamentId' | 'email', value: string): Promise<Invitation[]> {
  const db = getFirestore()
  const snap = await getDocs(
    query(collection(db, INVITATIONS_COLLECTION), where(field, '==', value), where('status', '==', 'pending')),
  )
  return snap.docs
    .map((invitation) => docToInvitation(invitation.id, invitation.data()))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

type CreateInvitationInput = {
  tournamentId: string
  email: string
  role: InvitationRole
  playerId?: string
  invitedBy: string
}

export async function createInvitation(input: CreateInvitationInput): Promise<string> {
  const { tournamentId, role, playerId, invitedBy } = input
  const email = normalizeEmail(input.email)

  if (role === 'MEMBER' && !playerId) throw new Error('A member invitation needs a player')

  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new Error('Tournament not found')

  const [members, pendingInvitations] = await Promise.all([
    getTournamentMembers(tournamentId),
    getPendingInvitations('tournamentId', tournamentId),
  ])
  if (members.some((member) => member.email === email)) {
    throw new Error('This email is already a member of the tournament')
  }
  if (pendingInvitations.some((invitation) => invitation.email === email)) {
    throw new Error('This email already has a pending invitation')
  }

  const db = getFirestore()

  if (playerId) {
    const player = await getDoc(doc(db, PLAYERS_COLLECTION, playerId))
    if (!player.exists()) throw new Error('Player not found')
    if (player.get('linkedUserId') || members.some((member) => member.playerId === playerId)) {
      throw new Error('This player is already linked to an account')
    }
  }

  const now = Timestamp.now()
  const newInvitationRef = doc(collection(db, INVITATIONS_COLLECTION))

  const batch = writeBatch(db)
  pendingInvitations
    .filter((invitation) => playerId && invitation.playerId === playerId)
    .forEach((invitation) => {
      batch.update(doc(db, INVITATIONS_COLLECTION, invitation.id), {
        status: 'revoked',
        resolvedAt: now,
        updatedAt: now,
      })
    })
  batch.set(newInvitationRef, {
    tournamentId,
    tournamentName: tournament.name,
    email,
    role,
    playerId: playerId ?? null,
    invitedBy,
    status: 'pending',
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
  })
  await batch.commit()

  return newInvitationRef.id
}

export async function getTournamentInvitations(tournamentId: string): Promise<Invitation[]> {
  return getPendingInvitations('tournamentId', tournamentId)
}

export async function getMyInvitations(email: string): Promise<Invitation[]> {
  const invitations = await getPendingInvitations('email', normalizeEmail(email))
  const tournamentIds = [...new Set(invitations.map((invitation) => invitation.tournamentId))]
  const tournaments = await Promise.all(tournamentIds.map((tournamentId) => getTournament(tournamentId)))
  const activeTournamentIds = new Set(tournaments.flatMap((tournament) => (tournament ? [tournament.id] : [])))
  return invitations.filter((invitation) => activeTournamentIds.has(invitation.tournamentId))
}

type InvitedUser = {
  uid: string
  email: string
}

export async function acceptInvitation(invitationId: string, user: InvitedUser): Promise<void> {
  const db = getFirestore()
  const email = normalizeEmail(user.email)

  await runTransaction(db, async (transaction) => {
    const invitationSnap = await transaction.get(doc(db, INVITATIONS_COLLECTION, invitationId))
    if (!invitationSnap.exists()) throw new Error('Invitation not found')
    const invitation = docToInvitation(invitationSnap.id, invitationSnap.data())
    if (invitation.status !== 'pending') throw new Error('This invitation is no longer pending')
    if (invitation.email !== email) throw new Error('This invitation belongs to another email')

    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, invitation.tournamentId)
    const tournamentSnap = await transaction.get(tournamentRef)
    if (!tournamentSnap.exists() || tournamentSnap.get('deletedAt')) throw new Error('Tournament not found')

    const memberRef = doc(db, TOURNAMENTS_COLLECTION, invitation.tournamentId, MEMBERS_COLLECTION, user.uid)
    const memberSnap = await transaction.get(memberRef)
    if (memberSnap.exists()) throw new Error('You are already a member of this tournament')

    const playerRef = invitation.playerId ? doc(db, PLAYERS_COLLECTION, invitation.playerId) : null
    if (playerRef) {
      const playerSnap = await transaction.get(playerRef)
      if (!playerSnap.exists()) throw new Error('Player not found')
      const linkedUserId = playerSnap.get('linkedUserId')
      if (linkedUserId && linkedUserId !== user.uid) throw new Error('This player is already linked to an account')
    }

    const now = Timestamp.now()
    transaction.set(memberRef, {
      uid: user.uid,
      tournamentId: invitation.tournamentId,
      email,
      role: invitation.role,
      playerId: invitation.playerId ?? null,
      joinedAt: now,
      updatedAt: now,
    })
    transaction.update(tournamentRef, { memberUids: arrayUnion(user.uid), updatedAt: now })
    if (playerRef) transaction.update(playerRef, { linkedUserId: user.uid, updatedAt: now })
    transaction.update(invitationSnap.ref, { status: 'accepted', resolvedAt: now, updatedAt: now })
  })
}

async function closeInvitation(
  invitationId: string,
  status: Extract<InvitationStatus, 'rejected' | 'revoked'>,
  email?: string,
): Promise<void> {
  const db = getFirestore()
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(doc(db, INVITATIONS_COLLECTION, invitationId))
    if (!snap.exists()) throw new Error('Invitation not found')
    if (snap.get('status') !== 'pending') throw new Error('This invitation is no longer pending')
    if (email && snap.get('email') !== normalizeEmail(email))
      throw new Error('This invitation belongs to another email')

    const now = Timestamp.now()
    transaction.update(snap.ref, { status, resolvedAt: now, updatedAt: now })
  })
}

export async function rejectInvitation(invitationId: string, email: string): Promise<void> {
  await closeInvitation(invitationId, 'rejected', email)
}

export async function revokeInvitation(invitationId: string): Promise<void> {
  await closeInvitation(invitationId, 'revoked')
}
