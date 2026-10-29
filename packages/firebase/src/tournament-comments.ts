import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import type { TournamentComment } from '@fulbito/types'
import { toDate } from './dates'
import { TOURNAMENTS_COLLECTION } from './tournaments'

export const COMMENTS_COLLECTION = 'comments'
export const TOURNAMENT_COMMENT_MAX_LENGTH = 500
const COMMENTS_FETCH_LIMIT = 200

function commentsRef(tournamentId: string) {
  return collection(getFirestore(), TOURNAMENTS_COLLECTION, tournamentId, COMMENTS_COLLECTION)
}

export function docToTournamentComment(
  tournamentId: string,
  id: string,
  data: Record<string, unknown>,
): TournamentComment {
  return {
    id,
    tournamentId,
    authorUid: typeof data['authorUid'] === 'string' ? data['authorUid'] : '',
    authorName: typeof data['authorName'] === 'string' ? data['authorName'] : '',
    text: typeof data['text'] === 'string' ? data['text'] : '',
    createdAt: data['createdAt'] ? toDate(data['createdAt']) : new Date(),
  }
}

export async function getTournamentComments(tournamentId: string): Promise<TournamentComment[]> {
  const snap = await getDocs(
    query(commentsRef(tournamentId), orderBy('createdAt', 'desc'), limit(COMMENTS_FETCH_LIMIT)),
  )
  return snap.docs.map((comment) => docToTournamentComment(tournamentId, comment.id, comment.data()))
}

type AddTournamentCommentInput = {
  tournamentId: string
  authorUid: string
  authorName: string
  text: string
}

export async function addTournamentComment(input: AddTournamentCommentInput): Promise<string> {
  const text = input.text.trim()
  if (!text) throw new Error('Comment text is required')
  if (text.length > TOURNAMENT_COMMENT_MAX_LENGTH) {
    throw new Error(`Comment must be at most ${TOURNAMENT_COMMENT_MAX_LENGTH} characters`)
  }
  const ref = await addDoc(commentsRef(input.tournamentId), {
    authorUid: input.authorUid,
    authorName: input.authorName.trim().slice(0, 80),
    text,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteTournamentComment(tournamentId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(commentsRef(tournamentId), commentId))
}
