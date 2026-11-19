import { collection, doc, type DocumentReference, getFirestore } from 'firebase/firestore'

export const MAIL_COLLECTION = 'mail'

export type PlayerLinkAcceptedMail = {
  to: string
  template: 'PLAYER_LINK_ACCEPTED'
  data: {
    playerName: string
    tournamentName: string
  }
}

export function newMailRef(): DocumentReference {
  return doc(collection(getFirestore(), MAIL_COLLECTION))
}

export function buildPlayerLinkAcceptedMail(
  to: string,
  playerName: string,
  tournamentName: string,
): PlayerLinkAcceptedMail {
  return { to, template: 'PLAYER_LINK_ACCEPTED', data: { playerName, tournamentName } }
}
