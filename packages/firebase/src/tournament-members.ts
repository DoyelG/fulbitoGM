import { arrayRemove, doc, getDoc, getFirestore, runTransaction, Timestamp, writeBatch } from 'firebase/firestore'
import type { InvitationRole } from '@fulbito/types'
import { PLAYERS_COLLECTION } from './players'
import { getTournamentMembers, MEMBERS_COLLECTION, TOURNAMENTS_COLLECTION } from './tournaments'

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

  if (playerId) {
    const members = await getTournamentMembers(tournamentId)
    if (members.some((member) => member.uid !== uid && member.playerId === playerId)) {
      throw new TournamentMemberError('Ese jugador ya está vinculado a otro miembro del torneo')
    }
  }

  await runTransaction(db, async (transaction) => {
    const memberSnap = await transaction.get(memberRef(tournamentId, uid))
    if (!memberSnap.exists()) throw new TournamentMemberError('El usuario ya no es miembro del torneo')

    if (playerId) {
      const playerSnap = await transaction.get(doc(db, PLAYERS_COLLECTION, playerId))
      if (!playerSnap.exists() || playerSnap.get('tournamentId') !== tournamentId) {
        throw new TournamentMemberError('No se encontró el jugador')
      }
    }

    transaction.update(memberSnap.ref, { playerId, updatedAt: Timestamp.now() })
  })
}

export async function setMemberRole(tournamentId: string, uid: string, role: InvitationRole): Promise<void> {
  await runTransaction(getFirestore(), async (transaction) => {
    const memberSnap = await transaction.get(memberRef(tournamentId, uid))
    if (!memberSnap.exists()) throw new TournamentMemberError('El usuario ya no es miembro del torneo')
    if (memberSnap.get('role') === 'OWNER') {
      throw new TournamentMemberError('No se puede cambiar el rol del creador del torneo')
    }

    transaction.update(memberSnap.ref, { role, updatedAt: Timestamp.now() })
  })
}

export async function removeMember(tournamentId: string, uid: string, actorUid: string): Promise<void> {
  if (uid === actorUid) throw new TournamentMemberError('Para salir del torneo usá "Abandonar"')

  const memberSnap = await getDoc(memberRef(tournamentId, uid))
  if (!memberSnap.exists()) throw new TournamentMemberError('El usuario ya no es miembro del torneo')
  if (memberSnap.get('role') === 'OWNER') throw new TournamentMemberError('No se puede eliminar al creador del torneo')

  const batch = writeBatch(getFirestore())
  batch.delete(memberSnap.ref)
  batch.update(doc(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId), {
    memberUids: arrayRemove(uid),
    updatedAt: Timestamp.now(),
  })
  await batch.commit()
}
