import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'

initializeApp()

const MATCHES_CHANNEL_ID = 'matches'
const BODY_MAX_LENGTH = 140
const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
])

function truncate(text: string): string {
  return text.length > BODY_MAX_LENGTH ? `${text.slice(0, BODY_MAX_LENGTH - 1)}…` : text
}

export const notifyTournamentComment = onDocumentCreated(
  'tournaments/{tournamentId}/comments/{commentId}',
  async (event) => {
    const comment = event.data?.data()
    if (!comment) return

    const { tournamentId } = event.params
    const authorUid = String(comment.authorUid)
    const db = getFirestore()

    const [tournamentSnap, membersSnap] = await Promise.all([
      db.doc(`tournaments/${tournamentId}`).get(),
      db.collection(`tournaments/${tournamentId}/members`).get(),
    ])

    const recipientUids = membersSnap.docs.map((member) => member.id).filter((uid) => uid !== authorUid)
    if (recipientUids.length === 0) return

    const deviceSnaps = await Promise.all(recipientUids.map((uid) => db.collection(`users/${uid}/devices`).get()))
    const devices = deviceSnaps.flatMap((snap) => snap.docs.map((device) => ({ token: device.id, ref: device.ref })))
    if (devices.length === 0) return

    const tournamentName = String(tournamentSnap.data()?.name ?? 'Mensajes')
    const response = await getMessaging().sendEachForMulticast({
      tokens: devices.map(({ token }) => token),
      notification: {
        title: tournamentName,
        body: truncate(`${String(comment.authorName)}: ${String(comment.text)}`),
      },
      data: { type: 'chat', tournamentId },
      android: { notification: { channelId: MATCHES_CHANNEL_ID } },
    })

    const staleRefs = response.responses.flatMap((result, index) =>
      !result.success && result.error && INVALID_TOKEN_CODES.has(result.error.code) ? [devices[index].ref] : [],
    )
    await Promise.all(staleRefs.map((ref) => ref.delete()))
  },
)
