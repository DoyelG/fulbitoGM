import type { MembershipRef, VideoClip, VideoClipCategory } from '@fulbito/types'
import { linkedMemberships } from './linked-memberships'
import { getAuth } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

export type NewVideoClipData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

function docToVideoClip(id: string, data: DocumentData): VideoClip {
  return {
    id,
    tournamentId: data.tournamentId ?? '',
    matchId: data.matchId,
    playerIds: data.playerIds ?? [],
    category: data.category,
    title: data.title ?? undefined,
    url: data.url,
    createdBy: data.createdBy ?? undefined,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  }
}

function videoClipFilePath(tournamentId: string, clipId: string): string {
  return `videoClips/${tournamentId}/${clipId}`
}

export async function getVideoClips(tournamentId: string): Promise<VideoClip[]> {
  const snapshot = await getDocs(
    query(
      collection(getFirestore(), 'videoClips'),
      where('tournamentId', '==', tournamentId),
      orderBy('createdAt', 'desc'),
    ),
  )
  return snapshot.docs.map((clipDocument) => docToVideoClip(clipDocument.id, clipDocument.data()))
}

export async function getMyVideoClips(memberships: MembershipRef[]): Promise<VideoClip[]> {
  const perTournament = await Promise.all(
    linkedMemberships(memberships).map(async ({ tournamentId, playerId }) => {
      const clips = await getVideoClips(tournamentId)
      return clips.filter((clip) => clip.playerIds.includes(playerId))
    }),
  )
  return perTournament.flat().sort((clipA, clipB) => clipB.createdAt.getTime() - clipA.createdAt.getTime())
}

export async function deleteClipsOfMatch(tournamentId: string, matchId: string): Promise<void> {
  const snapshot = await getDocs(
    query(
      collection(getFirestore(), 'videoClips'),
      where('tournamentId', '==', tournamentId),
      where('matchId', '==', matchId),
    ),
  )
  const results = await Promise.allSettled(
    snapshot.docs.map((clipDocument) => deleteVideoClip(docToVideoClip(clipDocument.id, clipDocument.data()))),
  )
  const failed = results.filter((result) => result.status === 'rejected').length
  if (failed > 0) throw new Error(`${failed} video clip(s) could not be deleted`)
}

export async function createVideoClip(tournamentId: string, data: NewVideoClipData, file: File | Blob): Promise<void> {
  const db = getFirestore()
  const clipId = doc(collection(db, 'videoClips')).id
  const storageRef = ref(getStorage(), videoClipFilePath(tournamentId, clipId))
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  const now = Timestamp.now()
  try {
    await setDoc(doc(db, 'videoClips', clipId), {
      tournamentId,
      matchId: data.matchId,
      playerIds: data.playerIds,
      category: data.category,
      title: data.title ?? null,
      url,
      createdBy: getAuth().currentUser?.uid ?? null,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    await deleteObject(storageRef).catch(() => undefined)
    throw error
  }
}

export async function deleteVideoClip(clip: Pick<VideoClip, 'id' | 'tournamentId'>): Promise<void> {
  await deleteObject(ref(getStorage(), videoClipFilePath(clip.tournamentId, clip.id))).catch(
    (error: { code?: string }) => {
      if (error.code !== 'storage/object-not-found') throw error
    },
  )
  await deleteDoc(doc(getFirestore(), 'videoClips', clip.id))
}
