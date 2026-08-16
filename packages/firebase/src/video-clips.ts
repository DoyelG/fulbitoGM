import {
  getFirestore, collection, doc,
  getDocs, setDoc, deleteDoc, Timestamp,
  query, orderBy,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import type { VideoClip } from '@fulbito/types'

function docToVideoClip(id: string, data: Record<string, any>): VideoClip {
  return {
    id,
    matchId: data.matchId,
    playerIds: data.playerIds ?? [],
    category: data.category,
    title: data.title ?? undefined,
    url: data.url,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  }
}

export function newVideoClipId(): string {
  const db = getFirestore()
  return doc(collection(db, 'videoClips')).id
}

export async function uploadVideoClip(file: File | Blob, clipId: string): Promise<string> {
  const storage = getStorage()
  const storageRef = ref(storage, `videoClips/${clipId}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

export async function deleteVideoClipFile(clipId: string): Promise<void> {
  const storage = getStorage()
  const storageRef = ref(storage, `videoClips/${clipId}`)
  try {
    await deleteObject(storageRef)
  } catch {
    // ignore if file doesn't exist
  }
}

export async function createVideoClip(
  id: string,
  data: Omit<VideoClip, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
  const db = getFirestore()
  await setDoc(doc(db, 'videoClips', id), {
    matchId: data.matchId,
    playerIds: data.playerIds,
    category: data.category,
    title: data.title ?? null,
    url: data.url,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

export async function getVideoClips(): Promise<VideoClip[]> {
  const db = getFirestore()
  const snap = await getDocs(query(collection(db, 'videoClips'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => docToVideoClip(d.id, d.data()))
}

export async function deleteVideoClip(id: string): Promise<void> {
  const db = getFirestore()
  await deleteDoc(doc(db, 'videoClips', id))
  await deleteVideoClipFile(id)
}
