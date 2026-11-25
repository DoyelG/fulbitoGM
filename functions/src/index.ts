import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret, defineString } from 'firebase-functions/params'
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore'
import { createTransport } from 'nodemailer'
import { isMailTemplate, MailTemplateError, renderMail } from './mail-templates'

initializeApp()

const smtpUrl = defineSecret('SMTP_URL')
const mailFrom = defineString('MAIL_FROM')
const appUrl = defineString('APP_URL')

const GRPC_ALREADY_EXISTS = 6

function isAlreadyExists(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === GRPC_ALREADY_EXISTS
}

export const queuePlayerLinkAcceptedMail = onDocumentDeleted(
  { document: 'tournaments/{tournamentId}/playerRequests/{uid}', region: 'us-central1' },
  async (event) => {
    const request = event.data?.data()
    if (!request || request.status !== 'pending') return
    if (typeof request.email !== 'string' || !request.email) return

    const { tournamentId, uid } = event.params
    const db = getFirestore()
    const [memberSnap, tournamentSnap] = await Promise.all([
      db.doc(`tournaments/${tournamentId}/members/${uid}`).get(),
      db.doc(`tournaments/${tournamentId}`).get(),
    ])

    const playerId: unknown = memberSnap.get('playerId')
    if (typeof playerId !== 'string' || !playerId) return
    if (request.playerId && request.playerId !== playerId) return

    const playerName: unknown = (await db.doc(`players/${playerId}`).get()).get('name')
    if (typeof playerName !== 'string') return
    const tournamentName: unknown = tournamentSnap.get('name')

    try {
      await db.doc(`mail/linkAccepted_${event.id}`).create({
        to: request.email,
        template: 'PLAYER_LINK_ACCEPTED',
        data: { playerName, tournamentName: typeof tournamentName === 'string' ? tournamentName : '' },
        tournamentId,
        requestUid: uid,
      })
    } catch (error) {
      if (!isAlreadyExists(error)) throw error
    }
  },
)

export const sendQueuedMail = onDocumentCreated(
  { document: 'mail/{mailId}', secrets: [smtpUrl], region: 'us-central1' },
  async (event) => {
    const mailRef = event.data?.ref
    if (!mailRef) return

    const claimed = await getFirestore().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(mailRef)
      if (snapshot.get('delivery.state')) return false
      transaction.update(mailRef, { delivery: { state: 'PROCESSING', startTime: FieldValue.serverTimestamp() } })
      return true
    })
    if (!claimed) return

    try {
      const { to, template, data } = (await mailRef.get()).data() ?? {}
      if (typeof to !== 'string') throw new MailTemplateError('Missing "to" in mail document')
      if (!isMailTemplate(template)) throw new MailTemplateError(`Unknown mail template "${String(template)}"`)

      const content = renderMail(template, data ?? {}, appUrl.value())
      await createTransport(smtpUrl.value()).sendMail({ from: mailFrom.value(), to, ...content })
      await mailRef.update({ delivery: { state: 'SUCCESS', endTime: FieldValue.serverTimestamp(), error: null } })
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error'
      await mailRef.update({ delivery: { state: 'ERROR', endTime: FieldValue.serverTimestamp(), error: reason } })
    }
  },
)
