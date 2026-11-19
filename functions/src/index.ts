import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret, defineString } from 'firebase-functions/params'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { createTransport } from 'nodemailer'
import { isMailTemplate, MailTemplateError, renderMail } from './mail-templates'

initializeApp()

const smtpUrl = defineSecret('SMTP_URL')
const mailFrom = defineString('MAIL_FROM')
const appUrl = defineString('APP_URL')

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
