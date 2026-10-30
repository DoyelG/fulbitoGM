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
import { PLAYERS_COLLECTION } from './players'
import { MEMBERS_COLLECTION, TOURNAMENTS_COLLECTION, getTournament, getTournamentMembers } from './tournaments'

const INVITATIONS_COLLECTION = 'invitations'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class InvitationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvitationError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(normalized)) throw new InvitationError('Ingresá un email válido')
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

  const tournament = await getTournament(tournamentId)
  if (!tournament) throw new InvitationError('No se encontró el torneo')

  const [members, pendingInvitations] = await Promise.all([
    getTournamentMembers(tournamentId),
    getPendingInvitations('tournamentId', tournamentId),
  ])
  if (members.some((member) => member.email === email)) {
    throw new InvitationError('Ese email ya es miembro del torneo')
  }
  if (pendingInvitations.some((invitation) => invitation.email === email)) {
    throw new InvitationError('Ese email ya tiene una invitación pendiente')
  }

  const db = getFirestore()

  if (playerId) {
    const player = await getDoc(doc(db, PLAYERS_COLLECTION, playerId))
    if (!player.exists() || player.get('tournamentId') !== tournamentId)
      throw new InvitationError('No se encontró el jugador')
    if (members.some((member) => member.playerId === playerId)) {
      throw new InvitationError('Ese jugador ya está vinculado a otro miembro del torneo')
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
  return getPendingInvitations('email', normalizeEmail(email))
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
    if (!invitationSnap.exists()) throw new InvitationError('No se encontró la invitación')
    const invitation = docToInvitation(invitationSnap.id, invitationSnap.data())
    if (invitation.status !== 'pending') throw new InvitationError('Esta invitación ya no está pendiente')
    if (invitation.email !== email) throw new InvitationError('Esta invitación es para otro email')

    const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, invitation.tournamentId)
    const memberRef = doc(db, TOURNAMENTS_COLLECTION, invitation.tournamentId, MEMBERS_COLLECTION, user.uid)
    const memberSnap = await transaction.get(memberRef)
    if (memberSnap.exists()) throw new InvitationError('Ya sos miembro de este torneo')

    const now = Timestamp.now()
    transaction.set(memberRef, {
      uid: user.uid,
      tournamentId: invitation.tournamentId,
      email,
      role: invitation.role,
      playerId: invitation.playerId ?? null,
      invitationId,
      joinedAt: now,
      updatedAt: now,
    })
    transaction.update(tournamentRef, { memberUids: arrayUnion(user.uid), updatedAt: now })
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
    if (!snap.exists()) throw new InvitationError('No se encontró la invitación')
    if (snap.get('status') !== 'pending') throw new InvitationError('Esta invitación ya no está pendiente')
    if (email && snap.get('email') !== normalizeEmail(email)) {
      throw new InvitationError('Esta invitación es para otro email')
    }

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
