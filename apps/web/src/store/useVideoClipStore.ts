import { create } from 'zustand'
import type { VideoClip } from '@fulbito/types'
import { createVideoClip, deleteVideoClip, getVideoClips, type NewVideoClipData } from '@fulbito/firebase'
import { getActiveTournamentId, isStillActive } from './active-tournament'

export type { NewVideoClipData }

type VideoClipStore = {
  videoClips: VideoClip[]
  videoClipsInit: 'idle' | 'loading' | 'loaded' | 'error'
  initLoad: () => Promise<void>
  addVideoClip: (data: NewVideoClipData, file: File) => Promise<void>
  deleteVideoClip: (id: string) => Promise<void>
  resetAndReload: () => Promise<void>
  reset: () => void
}

export const useVideoClipStore = create<VideoClipStore>()((set, get) => ({
  videoClips: [],
  videoClipsInit: 'idle',
  initLoad: async () => {
    const state = get().videoClipsInit
    if (state === 'loading' || state === 'loaded' || state === 'error') return
    set({ videoClipsInit: 'loading' })
    try {
      await get().resetAndReload()
    } catch {
      set({ videoClipsInit: 'error' })
    }
  },
  addVideoClip: async (data, file) => {
    await createVideoClip(getActiveTournamentId(), data, file)
    await get().resetAndReload()
  },
  deleteVideoClip: async (id) => {
    const clip = get().videoClips.find((videoClip) => videoClip.id === id)
    if (!clip) throw new Error('Video clip not found')
    await deleteVideoClip(clip)
    set((s) => ({ videoClips: s.videoClips.filter((c) => c.id !== id) }))
    await get().resetAndReload()
  },
  resetAndReload: async () => {
    const tournamentId = getActiveTournamentId()
    const data = await getVideoClips(tournamentId)
    if (isStillActive(tournamentId)) set({ videoClips: data, videoClipsInit: 'loaded' })
  },
  reset: () => set({ videoClips: [], videoClipsInit: 'idle' }),
}))
