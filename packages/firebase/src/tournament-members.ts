import { arrayRemove, doc, getDoc, getFirestore, runTransaction, Timestamp } from 'firebase/firestore'
import type { InvitationRole } from '@fulbito/types'
import { PLAYERS_COLLECTION } from './players'
import {
  getPendingInvitationRefs,
  MEMBERS_COLLECTION,
  playerLinkRef,
  revokePendingInvitations,
  TOURNAMENTS_COLLECTION,
} from './tournaments'

export class TournamentMemberError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TournamentMemberError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

function memberRef(tournamentId: string, uid: string) {
  return doc(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId, MEMBERS_COLLECTION, uid)
}

export async function setMemberPlayer(tournamentId: string, uid: string, playerId: string | null): Promise<void> {
  const db = getFirestore()

  await runTransaction(db, async (transaction) => {
    const memberSnap = await transaction.get(memberRef(tournamentId, uid))
    if (!memberSnap.exists()) throw new TournamentMemberError('El usuario ya no es miembro del torneo')
    const currentPlayerId: string | null = memberSnap.get('playerId') ?? null
    if (currentPlayerId === playerId) return

    if (playerId) {
      const [playerSnap, linkSnap] = await Promise.all([
        transaction.get(doc(db, PLAYERS_COLLECTION, playerId)),
        transaction.get(playerLinkRef(tournamentId, playerId)),
      ])
      if (!playerSnap.exists() || playerSnap.get('tournamentId') !== tournamentId) {
        throw new TournamentMemberError('No se encontró el jugador')
      }
      if (linkSnap.exists()) throw new TournamentMemberError('Ese jugador ya está vinculado a otro miembro del torneo')
    }

    if (currentPlayerId) transaction.delete(playerLinkRef(tournamentId, currentPlayerId))
    if (playerId) transaction.set(playerLinkRef(tournamentId, playerId), { uid })
    transaction.update(memberSnap.ref, { playerId, updatedAt: Timestamp.now() })
  })
}

export async function setMemberRole(tournamentId: string, uid: string, role: InvitationRole): Promise<void> {
  const invitationRefs = role === 'MEMBER' ? await getPendingInvitationRefs(tournamentId, uid) : []

  await runTransaction(getFirestore(), async (transaction) => {
    const memberSnap = await transaction.get(memberRef(tournamentId, uid))
    if (!memberSnap.exists()) throw new TournamentMemberError('El usuario ya no es miembro del torneo')
    if (memberSnap.get('role') === 'OWNER') {
      throw new TournamentMemberError('No se puede cambiar el rol del creador del torneo')
    }

    const now = Timestamp.now()
    await revokePendingInvitations(transaction, invitationRefs, now)
    transaction.update(memberSnap.ref, { role, updatedAt: now })
  })
}

export async function removeMember(tournamentId: string, uid: string, actorUid: string): Promise<void> {
  if (uid === actorUid) throw new TournamentMemberError('Para salir del torneo usá "Abandonar"')

  const memberSnap = await getDoc(memberRef(tournamentId, uid))
  if (!memberSnap.exists()) throw new TournamentMemberError('El usuario ya no es miembro del torneo')
  if (memberSnap.get('role') === 'OWNER') throw new TournamentMemberError('No se puede eliminar al creador del torneo')

  const invitationRefs = memberSnap.get('role') === 'ADMIN' ? await getPendingInvitationRefs(tournamentId, uid) : []

  await runTransaction(getFirestore(), async (transaction) => {
    const now = Timestamp.now()
    await revokePendingInvitations(transaction, invitationRefs, now)
    const playerId = memberSnap.get('playerId')
    if (playerId) transaction.delete(playerLinkRef(tournamentId, playerId))
    transaction.delete(memberSnap.ref)
    transaction.update(doc(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId), {
      memberUids: arrayRemove(uid),
      updatedAt: now,
    })
  })
}
