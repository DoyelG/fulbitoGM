'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Match, VideoClipCategory } from '@fulbito/types'
import { VIDEO_CLIP_CATEGORIES } from '@fulbito/types'
import { canDeleteVideoClip } from '@fulbito/utils'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { useVideoClipStore, type NewVideoClipData } from '@/store/useVideoClipStore'
import Modal from '@/components/Modal'
import VideoClipCarousel from '@/components/videoClips/VideoClipCarousel'
import VideoClipUploadForm from '@/components/videoClips/VideoClipUploadForm'
import WidgetError from '@/components/home/WidgetError'

type Props = {
  matches: Match[]
  canUpload: boolean
} & ({ playerId: string; matchId?: never } | { matchId: string; playerId?: never })

export default function VideoClipsSection({ playerId, matchId, matches, canUpload }: Props) {
  const { user } = useFirebaseAuth()
  const canManage = useCanManageTournament()
  const videoClips = useVideoClipStore((s) => s.videoClips)
  const videoClipsInit = useVideoClipStore((s) => s.videoClipsInit)
  const initLoad = useVideoClipStore((s) => s.initLoad)
  const addVideoClip = useVideoClipStore((s) => s.addVideoClip)
  const deleteVideoClip = useVideoClipStore((s) => s.deleteVideoClip)

  const [filter, setFilter] = useState<VideoClipCategory | 'all'>('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [playbackClipId, setPlaybackClipId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (videoClipsInit === 'idle') initLoad()
  }, [videoClipsInit, initLoad])

  const scopedClips = useMemo(
    () =>
      videoClips.filter((c) =>
        matchId ? c.matchId === matchId : playerId !== undefined && c.playerIds.includes(playerId),
      ),
    [videoClips, matchId, playerId],
  )
  const filteredClips = useMemo(
    () => (filter === 'all' ? scopedClips : scopedClips.filter((c) => c.category === filter)),
    [scopedClips, filter],
  )
  const matchById = useMemo(() => new Map(matches.map((m) => [m.id, m])), [matches])
  const uploadMatches = useMemo(() => (matchId ? matches.filter((m) => m.id === matchId) : matches), [matches, matchId])
  const playbackClip = playbackClipId ? (scopedClips.find((c) => c.id === playbackClipId) ?? null) : null

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
        {canUpload && (
          <button
            type="button"
            onClick={() => {
              setUploadError(null)
              setUploadOpen(true)
            }}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-primary-dark bg-primary-gradient text-white hover:bg-primary-gradient-dark hover:border-primary hover:ring-2 hover:ring-primary/30"
          >
            + Subir clip
          </button>
        )}
      </div>
      <div className="p-4" aria-busy={videoClipsInit === 'loading'}>
        {deleteError && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800"
          >
            <span>{deleteError}</span>
            <button
              type="button"
              onClick={() => setDeleteError(null)}
              className="ml-3 text-orange-800 hover:text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded"
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
              filter === 'all' ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {VIDEO_CLIP_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={filter === c.value}
              onClick={() => setFilter(c.value)}
              className={`px-3 py-1 rounded text-sm border ${
                filter === c.value ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {videoClipsInit === 'error' ? (
          <WidgetError message="No se pudieron cargar los clips." onRetry={() => void initLoad()} />
        ) : filteredClips.length === 0 ? (
          <div className="text-gray-800">
            {videoClipsInit === 'loading'
              ? 'Cargando clips...'
              : `No hay clips para este ${matchId ? 'partido' : 'jugador'} todavía.`}
          </div>
        ) : (
          <VideoClipCarousel
            clips={filteredClips}
            matchById={matchById}
            canDelete={(clip) => canDeleteVideoClip(clip, user?.uid, canManage)}
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
          matches={uploadMatches}
          currentPlayerId={playerId}
          lockedMatchId={matchId}
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
