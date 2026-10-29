import type { VideoClip, VideoClipCategory } from '@fulbito/types'
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

async function deleteVideoClipFile(clipId: string): Promise<void> {
  await deleteObject(ref(getStorage(), `videoClips/${clipId}`)).catch(() => undefined)
}

export async function getVideoClips(): Promise<VideoClip[]> {
  const snapshot = await getDocs(query(collection(getFirestore(), 'videoClips'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((clipDocument) => docToVideoClip(clipDocument.id, clipDocument.data()))
}

export async function createVideoClip(data: NewVideoClipData, file: File | Blob): Promise<void> {
  const db = getFirestore()
  const clipId = doc(collection(db, 'videoClips')).id
  const storageRef = ref(getStorage(), `videoClips/${clipId}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  const now = Timestamp.now()
  try {
    await setDoc(doc(db, 'videoClips', clipId), {
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
    await deleteVideoClipFile(clipId)
    throw error
  }
}

// The storage rule reads the clip document to check its author, so the file goes first.
export async function deleteVideoClip(clipId: string): Promise<void> {
  await deleteObject(ref(getStorage(), `videoClips/${clipId}`)).catch((error: { code?: string }) => {
    if (error.code !== 'storage/object-not-found') throw error
  })
  await deleteDoc(doc(getFirestore(), 'videoClips', clipId))
}
