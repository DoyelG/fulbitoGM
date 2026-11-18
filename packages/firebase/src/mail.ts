import { collection, doc, type DocumentReference, getFirestore } from 'firebase/firestore'

export const MAIL_COLLECTION = 'mail'

export type MailDoc = {
  to: string
  message: {
    subject: string
    text: string
    html: string
  }
}

export function newMailRef(): DocumentReference {
  return doc(collection(getFirestore(), MAIL_COLLECTION))
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildPlayerLinkAcceptedMail(to: string, playerName: string, tournamentName: string): MailDoc {
  const where = tournamentName ? ` del torneo ${tournamentName}` : ''
  return {
    to,
    message: {
      subject: 'Tu vinculación con el jugador fue aceptada',
      text: `¡Tu solicitud fue aceptada! Ya estás vinculado al jugador ${playerName}${where} en Fulbito GM.`,
      html: `<p>¡Tu solicitud fue aceptada!</p><p>Ya estás vinculado al jugador <strong>${escapeHtml(playerName)}</strong>${escapeHtml(where)} en Fulbito GM.</p>`,
    },
  }
}
