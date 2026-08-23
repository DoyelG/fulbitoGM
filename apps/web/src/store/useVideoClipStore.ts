import { create } from 'zustand'
import type { VideoClip, VideoClipCategory } from '@fulbito/types'
import { getApp } from 'firebase/app'
import {
  getFirestore, collection, doc, getDocs, setDoc, deleteDoc,
  query, orderBy, Timestamp, type DocumentData,
} from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

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
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
  }
}

async function fetchVideoClips(): Promise<VideoClip[]> {
  const db = getFirestore(getApp())
  const snap = await getDocs(query(collection(db, 'videoClips'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => docToVideoClip(d.id, d.data()))
}

async function deleteVideoClipFile(clipId: string): Promise<void> {
  const storage = getStorage(getApp())
  try {
    await deleteObject(ref(storage, `videoClips/${clipId}`))
  } catch {
    // ignore if file doesn't exist
  }
}

type VideoClipStore = {
  videoClips: VideoClip[]
  videoClipsInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addVideoClip: (data: NewVideoClipData, file: File) => Promise<void>
  deleteVideoClip: (id: string) => Promise<void>
  resetAndReload: () => Promise<void>
}

export const useVideoClipStore = create<VideoClipStore>()((set, get) => ({
  videoClips: [],
  videoClipsInit: 'idle',
  initLoad: async () => {
    const state = get().videoClipsInit
    if (state === 'loading' || state === 'loaded' || state === 'error') return
    set({ videoClipsInit: 'loading' })
    try {
      const data = await fetchVideoClips()
      set({ videoClips: data, videoClipsInit: 'loaded' })
    } catch {
      set({ videoClipsInit: 'error' })
    }
  },
  addVideoClip: async (data, file) => {
    const db = getFirestore(getApp())
    const storage = getStorage(getApp())
    const id = doc(collection(db, 'videoClips')).id
    const storageRef = ref(storage, `videoClips/${id}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    try {
      await setDoc(doc(db, 'videoClips', id), {
        matchId: data.matchId,
        playerIds: data.playerIds,
        category: data.category,
        title: data.title ?? null,
        url,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    } catch (err) {
      await deleteVideoClipFile(id)
      throw err
    }
    await get().resetAndReload()
  },
  deleteVideoClip: async (id) => {
    const db = getFirestore(getApp())
    await deleteDoc(doc(db, 'videoClips', id))
    await deleteVideoClipFile(id)
    set(s => ({ videoClips: s.videoClips.filter(c => c.id !== id) }))
    await get().resetAndReload()
  },
  resetAndReload: async () => {
    const data = await fetchVideoClips()
    set({ videoClips: data, videoClipsInit: 'loaded' })
  },
}))
