'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Match, Player, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { useVideoClipStore, type NewVideoClipData } from '@/store/useVideoClipStore'
import Modal from '@/components/Modal'
import Button from '@/components/Button'
import VideoClipCarousel from '@/components/videoClips/VideoClipCarousel'
import VideoClipUploadForm from '@/components/videoClips/VideoClipUploadForm'

type Props = {
  player: Player
  matches: Match[]
  isAdmin: boolean
}

export default function VideoClipsSection({ player, matches, isAdmin }: Props) {
  const videoClips = useVideoClipStore(state => state.videoClips)
  const videoClipsInit = useVideoClipStore(state => state.videoClipsInit)
  const initLoad = useVideoClipStore(state => state.initLoad)
  const addVideoClip = useVideoClipStore(state => state.addVideoClip)
  const deleteVideoClip = useVideoClipStore(state => state.deleteVideoClip)

  const [filter, setFilter] = useState<VideoClipCategory | 'all'>('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [playbackClipId, setPlaybackClipId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (videoClipsInit !== 'loaded') initLoad()
  }, [videoClipsInit, initLoad])

  const playerClips = useMemo(
    () => videoClips.filter(clip => clip.playerIds.includes(player.id)),
    [videoClips, player.id],
  )
  const filteredClips = useMemo(
    () => (filter === 'all' ? playerClips : playerClips.filter(clip => clip.category === filter)),
    [playerClips, filter],
  )
  const matchById = useMemo(() => new Map(matches.map(match => [match.id, match])), [matches])
  const playbackClip = playbackClipId ? (playerClips.find(clip => clip.id === playbackClipId) ?? null) : null

  const handleUpload = async (data: NewVideoClipData, file: File) => {
    setUploadError(null)
    try {
      await addVideoClip(data, file)
      setUploadOpen(false)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'No se pudo subir el clip.')
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este clip?')) return
    setDeleteError(null)
    try {
      await deleteVideoClip(id)
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'No se pudo eliminar el clip.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clips</h2>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => {
              setUploadError(null)
              setUploadOpen(true)
            }}
          >
            + Subir clip
          </Button>
        )}
      </div>
      <div className="p-4" aria-busy={videoClipsInit === 'loading'}>
        {deleteError && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          >
            <span>{deleteError}</span>
            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="ml-3 text-red-800 hover:text-red-950 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
              aria-label="Descartar error"
            >
              ✕
            </button>
          </div>
        )}
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
          {VIDEO_CLIP_CATEGORIES.map(clipCategory => (
            <button
              key={clipCategory.value}
              type="button"
              role="tab"
              aria-selected={filter === clipCategory.value}
              onClick={() => setFilter(clipCategory.value)}
              className={`px-3 py-1 rounded text-sm border ${
                filter === clipCategory.value ? 'bg-brand text-white border-brand' : 'hover:bg-gray-50'
              }`}
            >
              {clipCategory.icon} {clipCategory.label}
            </button>
          ))}
        </div>

        {videoClipsInit === 'error' ? (
          <div role="alert" className="text-red-800">
            No se pudieron cargar los clips.
          </div>
        ) : filteredClips.length === 0 ? (
          <div className="text-gray-800">
            {videoClipsInit === 'loading' ? 'Cargando clips...' : 'No hay clips para este jugador todavía.'}
          </div>
        ) : (
          <VideoClipCarousel
            clips={filteredClips}
            matchById={matchById}
            isAdmin={isAdmin}
            onOpen={setPlaybackClipId}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Modal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false)
          setUploadError(null)
        }}
        title="Subir clip"
      >
        <VideoClipUploadForm
          matches={matches}
          currentPlayerId={player.id}
          onSubmit={handleUpload}
          onCancel={() => {
            setUploadOpen(false)
            setUploadError(null)
          }}
          error={uploadError}
        />
      </Modal>

      <Modal
        open={playbackClip !== null}
        onClose={() => setPlaybackClipId(null)}
        title={playbackClip?.title || 'Clip'}
        size="large"
      >
        {playbackClip && (
          <video controls autoPlay className="w-full max-h-[75vh] rounded" src={playbackClip.url}>
            Tu navegador no soporta la reproducción de video.
          </video>
        )}
      </Modal>
    </div>
  )
}
