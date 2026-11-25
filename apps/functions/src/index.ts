import { initializeApp } from 'firebase-admin/app'
import { DocumentReference, getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'

initializeApp()

const MATCHES_CHANNEL_ID = 'matches'
const BODY_MAX_LENGTH = 140
const MULTICAST_LIMIT = 500
const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
])

function truncate(text: string): string {
  const characters = Array.from(text)
  return characters.length > BODY_MAX_LENGTH ? `${characters.slice(0, BODY_MAX_LENGTH - 1).join('')}…` : text
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size))
  return chunks
}

export const notifyTournamentComment = onDocumentCreated(
  'tournaments/{tournamentId}/comments/{commentId}',
  async (event) => {
    const comment = event.data?.data()
    if (!comment) return

    const { tournamentId } = event.params
    const authorUid = String(comment.authorUid)
    const db = getFirestore()

    const [tournamentSnap, membersSnap, authorDevicesSnap] = await Promise.all([
      db.doc(`tournaments/${tournamentId}`).get(),
      db.collection(`tournaments/${tournamentId}/members`).get(),
      db.collection(`users/${authorUid}/devices`).get(),
    ])

    const recipientUids = membersSnap.docs.map((member) => member.id).filter((uid) => uid !== authorUid)
    if (recipientUids.length === 0) return

    // The same phone can stay registered under several users if a sign-out failed to remove its token.
    const authorTokens = new Set(authorDevicesSnap.docs.map((device) => device.id))
    const deviceSnaps = await Promise.all(recipientUids.map((uid) => db.collection(`users/${uid}/devices`).get()))
    const refsByToken = new Map<string, DocumentReference[]>()
    for (const device of deviceSnaps.flatMap((snap) => snap.docs)) {
      if (authorTokens.has(device.id)) continue
      refsByToken.set(device.id, [...(refsByToken.get(device.id) ?? []), device.ref])
    }
    const tokens = [...refsByToken.keys()]
    if (tokens.length === 0) return

    const tournamentName = String(tournamentSnap.data()?.name ?? 'Mensajes')
    const body = truncate(`${String(comment.authorName)}: ${String(comment.text)}`)
    const messaging = getMessaging()

    const responses = await Promise.all(
      chunk(tokens, MULTICAST_LIMIT).map(async (batch) => {
        const { responses: results } = await messaging.sendEachForMulticast({
          tokens: batch,
          notification: { title: tournamentName, body },
          data: { type: 'chat', tournamentId },
          android: { notification: { channelId: MATCHES_CHANNEL_ID, tag: tournamentId } },
          apns: { payload: { aps: { sound: 'default', threadId: tournamentId } } },
        })
        return results.map((result, index) => ({ token: batch[index], result }))
      }),
    )

    const staleRefs = responses
      .flat()
      .filter(({ result }) => !result.success && result.error && INVALID_TOKEN_CODES.has(result.error.code))
      .flatMap(({ token }) => refsByToken.get(token) ?? [])
    await Promise.all(staleRefs.map((ref) => ref.delete()))
  },
)
