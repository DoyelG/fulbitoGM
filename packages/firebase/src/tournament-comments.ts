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
  startAfter,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { TournamentComment } from '@fulbito/types'
import { toDate } from './dates'
import { TOURNAMENTS_COLLECTION } from './tournaments'

export const COMMENTS_COLLECTION = 'comments'
export const TOURNAMENT_COMMENT_MAX_LENGTH = 500
export const TOURNAMENT_COMMENTS_PAGE_SIZE = 50

export type TournamentCommentsCursor = QueryDocumentSnapshot
export type TournamentCommentsPage = {
  comments: TournamentComment[]
  nextCursor: TournamentCommentsCursor | null
}

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

export async function getTournamentComments(
  tournamentId: string,
  after: TournamentCommentsCursor | null = null,
): Promise<TournamentCommentsPage> {
  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc'),
    ...(after ? [startAfter(after)] : []),
    limit(TOURNAMENT_COMMENTS_PAGE_SIZE + 1),
  ]
  const snap = await getDocs(query(commentsRef(tournamentId), ...constraints))
  const docs = snap.docs.slice(0, TOURNAMENT_COMMENTS_PAGE_SIZE)
  return {
    comments: docs.map((comment) => docToTournamentComment(tournamentId, comment.id, comment.data())),
    nextCursor: snap.docs.length > TOURNAMENT_COMMENTS_PAGE_SIZE ? (docs[docs.length - 1] ?? null) : null,
  }
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
