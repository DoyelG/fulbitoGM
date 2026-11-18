import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret, defineString } from 'firebase-functions/params'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { createTransport } from 'nodemailer'

initializeApp()

const smtpUrl = defineSecret('SMTP_URL')
const mailFrom = defineString('MAIL_FROM')

type MailMessage = {
  subject: string
  text: string
  html: string
}

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

    const { to, message } = (await mailRef.get()).data() as { to: string; message: MailMessage }

    try {
      await createTransport(smtpUrl.value()).sendMail({ from: mailFrom.value(), to, ...message })
      await mailRef.update({ delivery: { state: 'SUCCESS', endTime: FieldValue.serverTimestamp(), error: null } })
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error'
      await mailRef.update({ delivery: { state: 'ERROR', endTime: FieldValue.serverTimestamp(), error: reason } })
    }
  },
)
