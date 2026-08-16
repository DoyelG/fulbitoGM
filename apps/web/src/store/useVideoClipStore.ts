import { create } from 'zustand'
import type { VideoClip, VideoClipCategory } from '@fulbito/types'
import {
  uploadVideoClip,
  createVideoClip,
  getVideoClips,
  deleteVideoClip as deleteVideoClipRemote,
  deleteVideoClipFile,
  newVideoClipId,
} from '@fulbito/firebase'

export type NewVideoClipData = {
  matchId: string
  playerIds: string[]
  category: VideoClipCategory
  title?: string
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
    if (state === 'loading' || state === 'loaded') return
    set({ videoClipsInit: 'loading' })
    try {
      const data = await getVideoClips()
      set({ videoClips: data, videoClipsInit: 'loaded' })
    } catch {
      set({ videoClipsInit: 'error' })
    }
  },
  addVideoClip: async (data, file) => {
    const id = newVideoClipId()
    const url = await uploadVideoClip(file, id)
    try {
      await createVideoClip(id, { ...data, url })
    } catch (err) {
      await deleteVideoClipFile(id)
      throw err
    }
    await get().resetAndReload()
  },
  deleteVideoClip: async (id) => {
    await deleteVideoClipRemote(id)
    set(s => ({ videoClips: s.videoClips.filter(c => c.id !== id) }))
    await get().resetAndReload()
  },
  resetAndReload: async () => {
    const data = await getVideoClips()
    set({ videoClips: data, videoClipsInit: 'loaded' })
  },
}))
