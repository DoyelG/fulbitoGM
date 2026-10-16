import type { VideoClip, VideoClipCategory } from '@fulbito/types'
import {
  collection, doc, getDocs, setDoc, deleteDoc,
  query, orderBy, Timestamp, type DocumentData, getFirestore,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from 'firebase/storage'
import { useCallback, useEffect, useState } from 'react'

export type NewVideoClipData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
}

export type VideoClipsDataState = {
  videoClips: VideoClip[]
  loading: boolean
  refreshing: boolean
  error: string | null
  reload: () => Promise<void>
  refresh: () => Promise<void>
  addVideoClip: (data: NewVideoClipData, fileUri: string) => Promise<void>
  deleteVideoClip: (id: string) => Promise<void>
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
  const snap = await getDocs(query(collection(getFirestore(), 'videoClips'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => docToVideoClip(d.id, d.data()))
}

async function deleteVideoClipFile(clipId: string): Promise<void> {
  try {
    await deleteObject(ref(getStorage(), `videoClips/${clipId}`))
  } catch {
    return
  }
}

export function useVideoClipsData(): VideoClipsDataState {
  const [videoClips, setVideoClips] = useState<VideoClip[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setError(null)
    try {
      setVideoClips(await fetchVideoClips())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar los clips')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await reload()
  }, [reload])

  const addVideoClip = useCallback(async (data: NewVideoClipData, fileUri: string) => {
    const id = doc(collection(getFirestore(), 'videoClips')).id
    const response = await fetch(fileUri)
    const blob = await response.blob()
    const storageRef = ref(getStorage(), `videoClips/${id}`)
    await uploadBytes(storageRef, blob)
    const url = await getDownloadURL(storageRef)
    try {
      await setDoc(doc(getFirestore(), 'videoClips', id), {
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
    await reload()
  }, [reload])

  const deleteVideoClip = useCallback(async (id: string) => {
    await deleteDoc(doc(getFirestore(), 'videoClips', id))
    await deleteVideoClipFile(id)
    setVideoClips(prev => prev.filter(c => c.id !== id))
    await reload()
  }, [reload])

  useEffect(() => { void reload() }, [reload])

  return { videoClips, loading, refreshing, error, reload, refresh, addVideoClip, deleteVideoClip }
}
