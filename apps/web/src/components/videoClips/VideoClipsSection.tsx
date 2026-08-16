'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Match, Player, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { useVideoClipStore, type NewVideoClipData } from '@/store/useVideoClipStore'
import Modal from '@/components/Modal'
import VideoClipCard from '@/components/videoClips/VideoClipCard'
import VideoClipUploadForm from '@/components/videoClips/VideoClipUploadForm'

type Props = {
  player: Player
  matches: Match[]
  isAdmin: boolean
}

export default function VideoClipsSection({ player, matches, isAdmin }: Props) {
  const videoClips = useVideoClipStore(s => s.videoClips)
  const videoClipsInit = useVideoClipStore(s => s.videoClipsInit)
  const initLoad = useVideoClipStore(s => s.initLoad)
  const addVideoClip = useVideoClipStore(s => s.addVideoClip)
  const deleteVideoClip = useVideoClipStore(s => s.deleteVideoClip)

  const [filter, setFilter] = useState<VideoClipCategory | 'all'>('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [playbackClipId, setPlaybackClipId] = useState<string | null>(null)

  useEffect(() => {
    if (videoClipsInit !== 'loaded') initLoad()
  }, [videoClipsInit, initLoad])

  const playerClips = useMemo(
    () => videoClips.filter(c => c.playerIds.includes(player.id)),
    [videoClips, player.id],
  )
  const filteredClips = useMemo(
    () => (filter === 'all' ? playerClips : playerClips.filter(c => c.category === filter)),
    [playerClips, filter],
  )
  const matchById = useMemo(() => new Map(matches.map(m => [m.id, m])), [matches])
  const playbackClip = playbackClipId ? (playerClips.find(c => c.id === playbackClipId) ?? null) : null

  const handleUpload = async (data: NewVideoClipData, file: File) => {
    await addVideoClip(data, file)
    setUploadOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este clip?')) return
    await deleteVideoClip(id)
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clips</h2>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="px-3 py-1.5 rounded bg-brand text-white text-sm hover:bg-brand/90"
          >
            + Subir clip
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-4 flex-wrap" role="tablist" aria-label="Filtrar por categoría">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm border ${
              filter === 'all' ? 'bg-brand text-white border-brand' : 'hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {VIDEO_CLIP_CATEGORIES.map(c => (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={filter === c.value}
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1 rounded text-sm border ${
                filter === c.value ? 'bg-brand text-white border-brand' : 'hover:bg-gray-50'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {filteredClips.length === 0 ? (
          <div className="text-gray-800">No hay clips para este jugador todavía.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filteredClips.map(clip => (
              <VideoClipCard
                key={clip.id}
                clip={clip}
                match={matchById.get(clip.matchId)}
                isAdmin={isAdmin}
                onOpen={() => setPlaybackClipId(clip.id)}
                onDelete={() => handleDelete(clip.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Subir clip">
        <VideoClipUploadForm
          matches={matches}
          currentPlayerId={player.id}
          onSubmit={handleUpload}
          onCancel={() => setUploadOpen(false)}
        />
      </Modal>

      <Modal open={playbackClip !== null} onClose={() => setPlaybackClipId(null)} title={playbackClip?.title || 'Clip'}>
        {playbackClip && (
          <video controls autoPlay className="w-full rounded" src={playbackClip.url}>
            Tu navegador no soporta la reproducción de video.
          </video>
        )}
      </Modal>
    </div>
  )
}
