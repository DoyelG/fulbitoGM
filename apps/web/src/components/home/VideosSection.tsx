'use client'

import { useEffect, useMemo, useState } from 'react'
import type { VideoClipCategory } from '@fulbito/types'
import { formatMatchDate } from '@fulbito/utils'
import Modal from '@/components/Modal'
import { useMatchStore } from '@/store/useMatchStore'
import { useVideoClipStore } from '@/store/useVideoClipStore'
import VideoCarousel from './VideoCarousel'
import VideoFilters, { type VideoFilter } from './VideoFilters'
import VideosSkeleton from './VideosSkeleton'
import VideoThumb, { clipLabel } from './VideoThumb'
import WidgetError from './WidgetError'

export default function VideosSection() {
  const clips = useVideoClipStore((s) => s.videoClips)
  const status = useVideoClipStore((s) => s.videoClipsInit)
  const initLoad = useVideoClipStore((s) => s.initLoad)
  const reload = useVideoClipStore((s) => s.resetAndReload)
  const matches = useMatchStore((s) => s.matches)
  const [filter, setFilter] = useState<VideoFilter>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'idle') void initLoad()
  }, [status, initLoad])

  const dateByMatchId = useMemo(() => new Map(matches.map((m) => [m.id, formatMatchDate(m.date)])), [matches])
  const counts = useMemo(() => {
    const out: Partial<Record<VideoClipCategory, number>> = {}
    for (const c of clips) out[c.category] = (out[c.category] ?? 0) + 1
    return out
  }, [clips])
  const visible = useMemo(
    () => (filter === 'all' ? clips : clips.filter((c) => c.category === filter)),
    [clips, filter],
  )
  const openClip = clips.find((c) => c.id === openId) ?? null

  if (status === 'loaded' && clips.length === 0) return null

  return (
    <section
      aria-labelledby="videos-title"
      aria-busy={status === 'idle' || status === 'loading'}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="videos-title" className="text-base font-bold text-gray-900">
          <span aria-hidden className="mr-1.5">
            🎬
          </span>
          Videos
        </h2>
        {status === 'loaded' && (
          <VideoFilters active={filter} counts={counts} total={clips.length} onChange={setFilter} />
        )}
      </header>

      {(status === 'idle' || status === 'loading') && <VideosSkeleton />}
      {status === 'error' && <WidgetError onRetry={() => void reload().catch(() => undefined)} />}
      {status === 'loaded' && (
        <VideoCarousel key={filter} itemCount={visible.length}>
          {visible.map((clip) => (
            <li key={clip.id} className="w-60 shrink-0 snap-start">
              <VideoThumb clip={clip} matchDate={dateByMatchId.get(clip.matchId)} onOpen={() => setOpenId(clip.id)} />
            </li>
          ))}
        </VideoCarousel>
      )}

      <Modal
        open={openClip !== null}
        onClose={() => setOpenId(null)}
        title={openClip ? clipLabel(openClip) : 'Video'}
        size="large"
      >
        {openClip && (
          <video controls autoPlay playsInline className="max-h-[75vh] w-full rounded" src={openClip.url}>
            Tu navegador no soporta la reproducción de video.
          </video>
        )}
      </Modal>
    </section>
  )
}
