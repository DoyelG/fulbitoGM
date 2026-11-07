'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import type { Match, MatchInput, MatchLocation, MatchType } from '@fulbito/types'
import { useMatchStore } from '@/store/useMatchStore'
import { useVideoClipStore, type NewVideoClipData } from '@/store/useVideoClipStore'
import Button from '@/components/Button'
import ConfirmModal from '@/components/ConfirmModal'
import Modal from '@/components/Modal'
import Spinner from '@/components/Spinner'
import VideoClipUploadForm from '@/components/videoClips/VideoClipUploadForm'
import VideoClipCarousel from '@/components/videoClips/VideoClipCarousel'
import {
  buildPlayedBeforeSet,
  getEligiblePlayerIds,
  computeLeastAssignedPoolIds,
  getShirtDutiesByPlayerId,
} from '@/lib/shirtDuty'
import {
  onlyFinalMatches,
  buildMatchSchedule,
  parseMatchDate,
  formatMatchHour,
  formatMatchDate,
  canDeleteVideoClip,
  MATCH_TYPES,
  MAX_GOALKEEPERS,
} from '@fulbito/utils'
import HourField from '@/components/HourField'
import { usePlayerStore } from '@/store/usePlayerStore'
import { DropColumn, DraggableItem } from '@/components/DragAndDrop'
import { Pagination } from '../shared/Pagination'
import { InfiniteScrollSentinel } from '../shared/InfiniteScrollSentinel'
import { usePagination } from '../shared/use-pagination'
import { MatchDescription } from './matchDescription'
import FriendlySwitch from '@/components/FriendlySwitch'
import { fieldClassName, selectClassName, textareaClassName, compactFieldClassName } from '@/lib/field-styles'
import AddressPicker from '@/components/AddressPicker'
import MatchLocationLink from '@/components/MatchLocationLink'
import SearchInput from '@/components/SearchInput'
import { FiCheckCircle, FiEdit2, FiTrash2, FiVideo } from 'react-icons/fi'
import Chevron from '../shared/Icons/Chevron'
import WidgetError from '@/components/home/WidgetError'
import CopyMatchImageButton from '@/components/tournaments/detail/CopyMatchImageButton'
import { buildMatchImageData } from '@/lib/match-image-data'
import { useTournamentStore } from '@/store/useTournamentStore'


type RecordingPlayer = { id: string; name: string }

const MATCH_ACTION_SHAPE =
  'relative inline-flex h-11 w-11 items-center justify-center gap-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5'
const UPLOAD_CLIP_CLASS =
  'rounded border border-primary-dark bg-primary-gradient px-4 py-2 text-sm font-medium text-white hover:border-primary hover:bg-primary-gradient-dark hover:ring-2 hover:ring-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
const MATCH_ACTION_CLASS = `${MATCH_ACTION_SHAPE} bg-primary-dark/10 text-primary-dark hover:bg-primary-dark/15 focus-visible:ring-primary/40`
const MATCH_COMPLETE_CLASS = `${MATCH_ACTION_SHAPE} bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary/40`
const MATCH_DELETE_CLASS = `${MATCH_ACTION_SHAPE} bg-secondary/10 text-orange-700 hover:bg-secondary/20 focus-visible:ring-secondary/40`

export default function HistoryClient() {
  const { user } = useFirebaseAuth()
  const canManage = useCanManageTournament()
  const { addMatch, updateMatch, deleteMatch, matches: storeMatches, matchesInit } = useMatchStore()
  const { players: storePlayers } = usePlayerStore()
  const tournamentPhotoUrl = useTournamentStore(
    (state) =>
      state.myTournaments.find((entry) => entry.tournament.id === state.activeTournamentId)?.tournament.photoUrl ??
      null,
  )
  const playerById = useMemo(() => new Map(storePlayers.map((player) => [player.id, player])), [storePlayers])
  const [open, setOpen] = useState<false | { mode: 'create' } | { mode: 'edit'; match: Match }>(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const addVideoClip = useVideoClipStore((state) => state.addVideoClip)
  const deleteVideoClip = useVideoClipStore((state) => state.deleteVideoClip)
  const videoClips = useVideoClipStore((state) => state.videoClips)
  const videoClipsInit = useVideoClipStore((state) => state.videoClipsInit)
  const initVideoClipsLoad = useVideoClipStore((state) => state.initLoad)
  const [videoUploadMatch, setVideoUploadMatch] = useState<Match | null>(null)
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null)
  const [viewClipsMatch, setViewClipsMatch] = useState<Match | null>(null)
  const [viewPlaybackClipId, setViewPlaybackClipId] = useState<string | null>(null)
  const [viewDeleteError, setViewDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (videoClipsInit === 'idle') initVideoClipsLoad()
  }, [videoClipsInit, initVideoClipsLoad])

  const viewClips = useMemo(
    () => (viewClipsMatch ? videoClips.filter((c) => c.matchId === viewClipsMatch.id) : []),
    [videoClips, viewClipsMatch],
  )
  const viewMatchById = useMemo(
    () => (viewClipsMatch ? new Map([[viewClipsMatch.id, viewClipsMatch]]) : new Map()),
    [viewClipsMatch],
  )

  const openClipUpload = (match: Match) => {
    setVideoUploadError(null)
    setVideoUploadMatch(match)
    setViewClipsMatch(null)
  }
  const viewPlaybackClip = viewPlaybackClipId ? (viewClips.find((c) => c.id === viewPlaybackClipId) ?? null) : null

  const handleViewDelete = async (clipId: string) => {
    if (!window.confirm('¿Eliminar este clip?')) return
    setViewDeleteError(null)
    try {
      await deleteVideoClip(clipId)
    } catch (err) {
      setViewDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar el clip.')
    }
  }

  const selectedMatch = useMemo(
    () => storeMatches.find((match) => match.id === selectedMatchId) ?? null,
    [storeMatches, selectedMatchId],
  )

  const handleVideoUpload = async (data: NewVideoClipData, file: File) => {
    setVideoUploadError(null)
    try {
      await addVideoClip(data, file)
      setVideoUploadMatch(null)
    } catch (err) {
      setVideoUploadError(err instanceof Error ? err.message : 'No se pudo subir el clip.')
      throw err
    }
  }

  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const isLoadingMatches = matchesInit === 'idle' || matchesInit === 'loading'

  const filteredMatches = storeMatches.filter((match) => {
    const matchDateOnly = parseMatchDate(match).date
    if (fromDate && matchDateOnly < fromDate) return false
    if (toDate && matchDateOnly > toDate) return false
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase()
      const matchesTitle = match.name?.toLowerCase().includes(normalizedQuery) ?? false
      const matchesPlayerName = [...match.teamA, ...match.teamB].some((player) =>
        player.name.toLowerCase().includes(normalizedQuery),
      )
      if (!matchesTitle && !matchesPlayerName) return false
    }
    return true
  })

  const {
    items: displayedMatches,
    page,
    totalPages,
    setPage,
    showPagination,
    hasMore,
    sentinelRef,
  } = usePagination(filteredMatches, {
    resetKey: `${fromDate}|${toDate}|${searchQuery}`,
  })

  const handleDelete = (matchId: string) => {
    setShowModal(true)
    setSelectedMatchId(matchId)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteMatch(selectedMatchId as string)
    } catch {
      alert('Error al eliminar el partido')
    } finally {
      setShowModal(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">Historial de partidos</h1>
        {canManage && (
          <Button type="button" onClick={() => setOpen({ mode: 'create' })}>
            Cargar partido
          </Button>
        )}
      </div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por título o jugador..."
          ariaLabel="Buscar partido por título o jugador"
          className="flex-1"
        />
        <div className="flex flex-wrap gap-3">
          <label
            htmlFor="history-from"
            className="flex min-w-48 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 md:flex-none"
          >
            <span className="text-sm text-gray-500">Desde</span>
            <input
              id="history-from"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-2 focus:outline-none"
            />
          </label>
          <label
            htmlFor="history-to"
            className="flex min-w-48 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 md:flex-none"
          >
            <span className="text-sm text-gray-500">Hasta</span>
            <input
              id="history-to"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-2 focus:outline-none"
            />
          </label>
          {(fromDate || toDate) && (
            <Button
              variant="secondary"
              onClick={() => {
                setFromDate('')
                setToDate('')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
      <div className="space-y-4 mb-10">
        {isLoadingMatches ? (
          <Spinner label="Buscando partidos…" />
        ) : filteredMatches.length === 0 ? (
          <div className="text-black">No se encontraron partidos que coincidan con la búsqueda.</div>
        ) : (
          displayedMatches.map((match) => {
            const isDraft = match.status === 'draft'
            const { date: matchDay, hour } = parseMatchDate(match)
            return (
              <div
                key={match.id}
                className={`group relative bg-white rounded-lg shadow p-4 border-l-4 transition-all duration-200 hover:shadow-md hover:border-l-6 hover:pl-3.5 ${isDraft ? 'border-amber-400' : match.isFriendly ? 'border-green-400' : 'border-primary-dark'}`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <Link
                      href={`/history/${match.id}`}
                      aria-label={`Ver partido${match.name ? ` ${match.name}` : ''} del ${formatMatchDate(matchDay)}`}
                      className="rounded after:absolute after:inset-0 after:rounded-lg after:content-[''] focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
                    >
                      {match.name && (
                        <span className="block text-lg mb-1 font-bold transition-colors group-hover:text-primary group-hover:underline">
                          {match.name}
                        </span>
                      )}
                      <strong>
                        {formatMatchDate(matchDay)}
                        {hour !== null ? ` ${formatMatchHour(hour)}` : ''}
                      </strong>
                    </Link>
                    <span className="ml-2 inline-block bg-primary-dark text-white text-xs px-2 py-0.5 rounded">
                      {match.type}
                    </span>
                    {isDraft && (
                      <span className="ml-2 inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Borrador
                      </span>
                    )}
                    {match.isFriendly && (
                      <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Amistoso
                      </span>
                    )}
                  </div>
                  {isDraft ? (
                    canManage && (
                      <button
                        type="button"
                        className={`${MATCH_COMPLETE_CLASS} relative z-10 shrink-0`}
                        onClick={() => setOpen({ mode: 'edit', match })}
                        aria-label="Completar resultado"
                      >
                        <FiCheckCircle className="h-[18px] w-[18px] sm:h-4 sm:w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Completar resultado</span>
                      </button>
                    )
                  ) : (
                    <div className="shrink-0 rounded-full bg-primary-dark/10 px-4 py-1.5 text-xl font-extrabold text-primary-dark">
                      {match.teamAScore} – {match.teamBScore}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  <div
                    className={`flex-1 min-w-0 ${
                      isDraft
                        ? 'bg-gray-50'
                        : match.teamAScore > match.teamBScore
                          ? 'bg-primary-dark/5'
                          : match.teamAScore < match.teamBScore
                            ? 'bg-secondary/10'
                            : 'bg-gray-50'
                    } rounded p-2`}
                  >
                    <h4 className="text-center font-semibold mb-2 text-sm">Equipo A</h4>
                    {match.teamA.map((player: Match['teamA'][number]) => (
                      <div
                        key={player.id}
                        className="flex justify-between items-center border-b last:border-b-0 py-0.5 gap-1"
                      >
                        <span className="text-sm truncate">{player.name}</span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                          {match.goalkeeperIds?.includes(player.id) && (
                            <span aria-label="Arquero" role="img">
                              🧤
                            </span>
                          )}
                          {!isDraft && (
                            <>
                              {match.mvpId === player.id && (
                                <span aria-label="MVP" role="img">
                                  🏆
                                </span>
                              )}
                              {player.goals}⚽ {player.performance}★
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className={`flex-1 min-w-0 ${
                      isDraft
                        ? 'bg-gray-50'
                        : match.teamBScore > match.teamAScore
                          ? 'bg-primary-dark/5'
                          : match.teamBScore < match.teamAScore
                            ? 'bg-secondary/10'
                            : 'bg-gray-50'
                    } rounded p-2`}
                  >
                    <h4 className="text-center font-semibold mb-2 text-sm">Equipo B</h4>
                    {match.teamB.map((player: Match['teamB'][number]) => (
                      <div
                        key={player.id}
                        className="flex justify-between items-center border-b last:border-b-0 py-0.5 gap-1"
                      >
                        <span className="text-sm truncate">{player.name}</span>
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                          {match.goalkeeperIds?.includes(player.id) && (
                            <span aria-label="Arquero" role="img">
                              🧤
                            </span>
                          )}
                          {!isDraft && (
                            <>
                              {match.mvpId === player.id && (
                                <span aria-label="MVP" role="img">
                                  🏆
                                </span>
                              )}
                              {player.goals}⚽ {player.performance}★
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative z-10 mt-3 space-y-3 pb-2">
                  {match.description && <MatchDescription text={match.description} />}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                      {match.location?.name && (
                        <div className="min-w-0">
                          <span className="text-gray-700">Ubicación:</span>{' '}
                          <MatchLocationLink location={match.location} />
                        </div>
                      )}
                      {match.shirtsResponsibleId && (
                        <div className="flex min-w-0 items-center gap-1">
                          <span className="text-gray-700">Lava:</span>
                          <span className="truncate font-medium">
                            {storePlayers.find((player) => player.id === match.shirtsResponsibleId)?.name ?? '—'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-auto flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className={MATCH_ACTION_CLASS}
                        onClick={() => setViewClipsMatch(match)}
                        aria-label={`Ver clips del partido${match.name ? `: ${match.name}` : ''}`}
                      >
                        <FiVideo className="h-[18px] w-[18px] sm:h-4 sm:w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Clips</span>
                        {videoClips.filter((clip) => clip.matchId === match.id).length > 0 && (
                          <span className="absolute -right-1 -top-1 rounded-full bg-primary-dark px-1.5 text-xs text-white sm:static">
                            {videoClips.filter((clip) => clip.matchId === match.id).length}
                          </span>
                        )}
                      </button>
                      {isDraft && (
                        <CopyMatchImageButton
                          variant="action"
                          className={MATCH_ACTION_CLASS}
                          data={buildMatchImageData(match, playerById, tournamentPhotoUrl)}
                        />
                      )}
                      {canManage && (
                        <>
                          <button
                            type="button"
                            className={MATCH_ACTION_CLASS}
                            onClick={() => setOpen({ mode: 'edit', match })}
                            aria-label="Editar partido"
                          >
                            <FiEdit2 className="h-[18px] w-[18px] sm:h-4 sm:w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            type="button"
                            className={MATCH_DELETE_CLASS}
                            onClick={() => handleDelete(match.id)}
                            aria-label="Eliminar partido"
                          >
                            <FiTrash2 className="h-[18px] w-[18px] sm:h-4 sm:w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      {hasMore && <InfiniteScrollSentinel sentinelRef={sentinelRef} label="Cargando más partidos…" className="mb-4" />}
      {showPagination && !isLoadingMatches && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          label="Paginación del historial"
          className="mb-10"
        />
      )}

      <ConfirmModal
        title="Confirmar eliminación"
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
        icon={FiTrash2}
        tone="danger"
        confirmLabel="Eliminar"
      >
        <p>
          ¿Estás seguro de que querés eliminar al partido:{' '}
          <span className="font-medium text-gray-900">{selectedMatch?.name}</span>?
        </p>
      </ConfirmModal>

      <Modal
        open={open !== false}
        onClose={() => setOpen(false)}
        title={open !== false && open.mode === 'edit' ? 'Editar Resultado del Partido' : 'Registrar Resultado del Partido'}
        size="large"
      >
        {open !== false && (
          <RecordModal
            mode={open.mode}
            initial={open.mode === 'edit' ? open.match : undefined}
            onClose={() => setOpen(false)}
            onSave={async (match) => {
              if (open.mode === 'edit' && open.match) {
                await updateMatch(open.match.id, match)
              } else {
                await addMatch(match)
              }
            }}
          />
        )}
      </Modal>

      <Modal
        open={videoUploadMatch !== null}
        onClose={() => {
          setVideoUploadMatch(null)
          setVideoUploadError(null)
        }}
        title="Subir clip"
      >
        {videoUploadMatch && (
          <VideoClipUploadForm
            matches={[videoUploadMatch]}
            lockedMatchId={videoUploadMatch.id}
            onSubmit={handleVideoUpload}
            onCancel={() => {
              setVideoUploadMatch(null)
              setVideoUploadError(null)
            }}
            error={videoUploadError}
          />
        )}
      </Modal>

      <Modal
        open={viewClipsMatch !== null}
        onClose={() => {
          setViewClipsMatch(null)
          setViewDeleteError(null)
        }}
        title={`Clips${viewClipsMatch?.name ? `: ${viewClipsMatch.name}` : ''}`}
        size="large"
      >
        {canManage && viewClipsMatch && viewClips.length > 0 && (
          <div className="flex justify-end mb-4">
            <button type="button" className={UPLOAD_CLIP_CLASS} onClick={() => openClipUpload(viewClipsMatch)}>
              + Subir clip
            </button>
          </div>
        )}
        {viewDeleteError && (
          <div
            role="alert"
            className="mb-4 flex items-center justify-between rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800"
          >
            <span>{viewDeleteError}</span>
            <button
              type="button"
              onClick={() => setViewDeleteError(null)}
              className="ml-3 text-orange-800 hover:text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded"
              aria-label="Descartar error"
            >
              ✕
            </button>
          </div>
        )}
        {videoClipsInit === 'error' ? (
          <WidgetError message="No se pudieron cargar los clips." onRetry={() => void initVideoClipsLoad()} />
        ) : viewClips.length === 0 ? (
          videoClipsInit === 'loading' ? (
            <div className="text-gray-800" aria-live="polite">
              Cargando clips...
            </div>
          ) : (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FiVideo className="h-7 w-7" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Todavía no hay clips</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-700">
                {canManage
                  ? 'Subí el primero y que todos vean las mejores jugadas del partido.'
                  : 'Cuando alguien suba un clip de este partido, lo vas a ver acá.'}
              </p>
              {canManage && viewClipsMatch && (
                <button
                  type="button"
                  className={`mt-5 ${UPLOAD_CLIP_CLASS}`}
                  onClick={() => openClipUpload(viewClipsMatch)}
                >
                  + Subir el primer clip
                </button>
              )}
            </div>
          )
        ) : (
          <VideoClipCarousel
            clips={viewClips}
            matchById={viewMatchById}
            canDelete={(clip) => canDeleteVideoClip(clip, user?.uid, canManage)}
            onOpen={setViewPlaybackClipId}
            onDelete={handleViewDelete}
          />
        )}
      </Modal>

      <Modal
        open={viewPlaybackClip !== null}
        onClose={() => setViewPlaybackClipId(null)}
        title={viewPlaybackClip?.title || 'Clip'}
        size="large"
      >
        {viewPlaybackClip && (
          <video controls autoPlay className="w-full max-h-[75vh] rounded" src={viewPlaybackClip.url}>
            Tu navegador no soporta la reproducción de video.
          </video>
        )}
      </Modal>
    </div>
  )
}

export function RecordModal({
  mode = 'create',
  initial,
  onClose,
  onSave,
}: {
  mode?: 'create' | 'edit'
  initial?: Match
  onClose: () => void
  onSave: (match: MatchInput) => void
}) {
  const { players } = usePlayerStore()
  const { matches: allMatches } = useMatchStore()
  const finalMatches = useMemo(() => onlyFinalMatches(allMatches), [allMatches])
  const playedBefore = useMemo(() => buildPlayedBeforeSet(finalMatches), [finalMatches])
  const dutiesById = useMemo(() => getShirtDutiesByPlayerId(finalMatches), [finalMatches])
  const [matchDate, setMatchDate] = useState<string>(
    initial ? parseMatchDate(initial).date : new Date().toISOString().slice(0, 10),
  )
  const [matchHour, setMatchHour] = useState<number | null>(initial ? parseMatchDate(initial).hour : null)

  const [matchType, setMatchType] = useState<MatchType>((initial?.type as MatchType) || '5v5')
  const [matchLocation, setMatchLocation] = useState<MatchLocation | null>(initial?.location ?? null)
  const playersPerTeam = useMemo(() => parseInt(matchType.split('v')[0], 10), [matchType])

  const [isLoading, setIsLoading] = useState(false)
  const isDraft = initial?.status === 'draft'

  const [teamA, setTeamA] = useState<RecordingPlayer[]>(
    initial?.teamA?.map((player: Match['teamA'][number]) => ({
      id: player.id,
      name: player.name,
    })) || [],
  )
  const [teamB, setTeamB] = useState<RecordingPlayer[]>(
    initial?.teamB?.map((player: Match['teamB'][number]) => ({
      id: player.id,
      name: player.name,
    })) || [],
  )

  const unassigned = useMemo(() => {
    const ids = new Set([...teamA, ...teamB].map((player) => player.id))
    return players
      .filter((player) => !ids.has(player.id) && !player.inactive)
      .map((player) => ({ id: player.id, name: player.name }))
  }, [players, teamA, teamB])

  const [teamAScore, setTeamAScore] = useState<number | ''>(
    typeof initial?.teamAScore === 'number' ? initial.teamAScore : '',
  )
  const [teamBScore, setTeamBScore] = useState<number | ''>(
    typeof initial?.teamBScore === 'number' ? initial.teamBScore : '',
  )
  const [matchName, setMatchName] = useState<string>(initial?.name || '')
  const [matchDescription, setMatchDescription] = useState<string>(initial?.description || '')
  const [isFriendly, setIsFriendly] = useState<boolean>(initial?.isFriendly ?? false)
  const selectedPlayersForDuty = useMemo(() => {
    const all = [...teamA, ...teamB]
    const teamIds = all.map((player) => player.id)
    const consideredIds = getEligiblePlayerIds(teamIds, playedBefore)
    const { poolIds, min } = computeLeastAssignedPoolIds(consideredIds, dutiesById)
    const pool = all.filter((player) => poolIds.includes(player.id))
    return { pool, min }
  }, [teamA, teamB, dutiesById, playedBefore])
  const [shirtsResponsibleId, setShirtsResponsibleId] = useState<string | null>(initial?.shirtsResponsibleId ?? null)
  const [mvpId, setMvpId] = useState<string | null>(initial?.mvpId ?? null)
  const [goalkeeperIds, setGoalkeeperIds] = useState<string[]>(initial?.goalkeeperIds ?? [])

  useEffect(() => {
    if (!mvpId) return
    const inTeams = [...teamA, ...teamB].some((player) => player.id === mvpId)
    if (!inTeams) setMvpId(null)
  }, [teamA, teamB, mvpId])

  useEffect(() => {
    const ids = new Set([...teamA, ...teamB].map((player) => player.id))
    setGoalkeeperIds((prev) => {
      const next = prev.filter((id) => ids.has(id))
      return next.length === prev.length ? prev : next
    })
  }, [teamA, teamB])

  const toggleGoalkeeper = (id: string) =>
    setGoalkeeperIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_GOALKEEPERS ? prev : [...prev, id],
    )

  const [goalsA, setGoalsA] = useState<Record<string, number>>(() =>
    Object.fromEntries((initial?.teamA || []).map((player: Match['teamA'][number]) => [player.id, player.goals])),
  )
  const [perfA, setPerfA] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (initial?.teamA || []).map((player: Match['teamA'][number]) => [player.id, player.performance || 5]),
    ),
  )
  const [goalsB, setGoalsB] = useState<Record<string, number>>(() =>
    Object.fromEntries((initial?.teamB || []).map((player: Match['teamB'][number]) => [player.id, player.goals])),
  )
  const [perfB, setPerfB] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (initial?.teamB || []).map((player: Match['teamB'][number]) => [player.id, player.performance || 5]),
    ),
  )

  const totalGoalsA = useMemo(() => Object.values(goalsA).reduce((sum, n) => sum + (n || 0), 0), [goalsA])
  const totalGoalsB = useMemo(() => Object.values(goalsB).reduce((sum, n) => sum + (n || 0), 0), [goalsB])

  const move = (player: RecordingPlayer, target: 'unassigned' | 'a' | 'b') => {
    setTeamA((prev) => prev.filter((teamPlayer) => teamPlayer.id !== player.id))
    setTeamB((prev) => prev.filter((teamPlayer) => teamPlayer.id !== player.id))
    if (target === 'a') setTeamA((prev) => (prev.length >= playersPerTeam ? prev : [...prev, player]))
    if (target === 'b') setTeamB((prev) => (prev.length >= playersPerTeam ? prev : [...prev, player]))
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>, target: 'unassigned' | 'a' | 'b') => {
    const json = event.dataTransfer.getData('application/json')
    if (!json) return
    const player: RecordingPlayer = JSON.parse(json)
    move(player, target)
  }

  const Draggable = ({ player }: { player: RecordingPlayer }) => (
    <DraggableItem
      data={player}
      label={player.name}
      isGoalkeeper={goalkeeperIds.includes(player.id)}
      onClick={() => {
        const choice = prompt(`Move ${player.name} to:\n1. Unassigned\n2. Team A\n3. Team B\n\nEnter 1, 2, or 3:`)
        if (choice === '1') move(player, 'unassigned')
        if (choice === '2') move(player, 'a')
        if (choice === '3') move(player, 'b')
      }}
    />
  )

  const teamsComplete = teamA.length === playersPerTeam && teamB.length === playersPerTeam
  const canConfirm =
    (typeof teamAScore === 'number' ? teamAScore : 0) === totalGoalsA &&
    (typeof teamBScore === 'number' ? teamBScore : 0) === totalGoalsB &&
    teamsComplete
  const canUpdateDraft = teamsComplete

  const buildPayload = (status: 'draft' | 'final'): MatchInput => {
    const isFinal = status === 'final'
    const pool = selectedPlayersForDuty.pool
    const chosen = shirtsResponsibleId || (pool.length ? pool[Math.floor(Math.random() * pool.length)].id : undefined)

    return {
      ...buildMatchSchedule(matchDate, matchHour),
      type: matchType,
      location: matchLocation ?? undefined,
      status,
      teamAScore: isFinal ? (teamAScore as number) : 0,
      teamBScore: isFinal ? (teamBScore as number) : 0,
      teamA: teamA.map((player) => ({
        id: player.id,
        name: player.name,
        goals: isFinal ? goalsA[player.id] || 0 : 0,
        performance: isFinal ? perfA[player.id] || 5 : 0,
      })),
      teamB: teamB.map((player) => ({
        id: player.id,
        name: player.name,
        goals: isFinal ? goalsB[player.id] || 0 : 0,
        performance: isFinal ? perfB[player.id] || 5 : 0,
      })),
      name: matchName.trim() || undefined,
      description: matchDescription.trim() || undefined,
      shirtsResponsibleId: chosen ?? null,
      mvpId: isFinal ? mvpId : null,
      goalkeeperIds,
      isFriendly,
    }
  }

  const handleSave = async (targetStatus: 'draft' | 'final') => {
    if (targetStatus === 'final' && !canConfirm) return
    if (targetStatus === 'draft' && !canUpdateDraft) return

    setIsLoading(true)

    try {
      await onSave(buildPayload(targetStatus))

      alert(targetStatus === 'final' ? 'Partido guardado correctamente!' : 'Borrador actualizado!')
      onClose()
    } catch {
      alert('Error al guardar el partido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
        <div className="grid sm:grid-cols-[auto_auto_auto_1fr_auto] gap-3 mb-3">
          <HourField id="match-hour" value={matchHour} onChange={setMatchHour} />
          <div>
            <label htmlFor="match-date" className="block text-sm font-medium mb-1">
              Fecha
            </label>
            <input
              id="match-date"
              type="date"
              value={matchDate}
              onChange={(event) => setMatchDate(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Modo de Partido</label>
            <div className="relative">
              <select
                value={matchType}
                onChange={(event) => {
                  setTeamA([])
                  setTeamB([])
                  setMatchType(event.target.value as MatchType)
                }}
                className={selectClassName}
              >
                {MATCH_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Chevron select />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ubicación</label>
            <AddressPicker value={matchLocation} onChange={setMatchLocation} />
          </div>
          <FriendlySwitch
            isFriendly={isFriendly}
            onToggle={() => setIsFriendly((current) => !current)}
            labelClassName="block text-sm font-medium mb-1"
          />
          <div className="sm:col-span-5">
            <label className="block text-lg font-medium mb-1">Nombre del Partido</label>
            <input
              type="text"
              value={matchName}
              onChange={(event) => setMatchName(event.target.value)}
              className={fieldClassName}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <DropColumn
            title="Jugadores Disponibles"
            target="unassigned"
            playersCount={unassigned.length}
            onDrop={(event) => onDrop(event, 'unassigned')}
          >
            {unassigned.map((player) => (
              <Draggable key={player.id} player={player} />
            ))}
          </DropColumn>
          <DropColumn
            title="Equipo A"
            target="a"
            playersCount={teamA.length}
            limit={playersPerTeam}
            listClassName="max-h-96 overflow-y-auto"
            onDrop={(event) => onDrop(event, 'a')}
          >
            {teamA.map((player) => (
              <Draggable key={player.id} player={player} />
            ))}
          </DropColumn>
          <DropColumn
            title="Equipo B"
            target="b"
            playersCount={teamB.length}
            limit={playersPerTeam}
            listClassName="max-h-96 overflow-y-auto"
            onDrop={(event) => onDrop(event, 'b')}
          >
            {teamB.map((player) => (
              <Draggable key={player.id} player={player} />
            ))}
          </DropColumn>
        </div>

        <div className="mb-4">
          <label htmlFor="match-description-history" className="block text-sm font-medium mb-1">
            Crónica
          </label>
          <textarea
            id="match-description-history"
            value={matchDescription}
            onChange={(event) => setMatchDescription(event.target.value)}
            placeholder="Escribí la crónica del partido"
            className={textareaClassName}
          />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
          <div className="bg-gray-50 rounded p-3">
            <h4 className="text-center font-semibold mb-2">Equipo A</h4>
            <input
              type="number"
              min={0}
              placeholder="Goles del Equipo A"
              value={teamAScore}
              onChange={(event) => setTeamAScore(event.target.value === '' ? '' : Number(event.target.value))}
              className={`${compactFieldClassName} w-24 text-center mb-2`}
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamA.map((player) => (
                <div key={player.id} className="flex items-center justify-between bg-white border border-gray-300 rounded px-3 py-2">
                  <span className="font-medium">{player.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={goalsA[player.id] ?? 0}
                      onChange={(event) =>
                        setGoalsA((prev) => ({
                          ...prev,
                          [player.id]: Number(event.target.value || 0),
                        }))
                      }
                      className={`${compactFieldClassName} w-16 text-center`}
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={perfA[player.id] ?? 5}
                      onChange={(event) =>
                        setPerfA((prev) => ({
                          ...prev,
                          [player.id]: Number(event.target.value || 5),
                        }))
                      }
                      className={`${compactFieldClassName} w-16 text-center`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`mt-2 text-center font-semibold rounded px-2 py-1 ${
                teamAScore === totalGoalsA ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}
            >
              Total: {totalGoalsA} goles
            </div>
          </div>

          <div className="text-center font-bold text-black">VS</div>

          <div className="bg-gray-50 rounded p-3">
            <h4 className="text-center font-semibold mb-2">Equipo B</h4>
            <input
              type="number"
              min={0}
              placeholder="Goles del Equipo B"
              value={teamBScore}
              onChange={(event) => setTeamBScore(event.target.value === '' ? '' : Number(event.target.value))}
              className={`${compactFieldClassName} w-24 text-center mb-2`}
            />
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamB.map((player) => (
                <div key={player.id} className="flex items-center justify-between bg-white border border-gray-300 rounded px-3 py-2">
                  <span className="font-medium">{player.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={goalsB[player.id] ?? 0}
                      onChange={(event) =>
                        setGoalsB((prev) => ({
                          ...prev,
                          [player.id]: Number(event.target.value || 0),
                        }))
                      }
                      className={`${compactFieldClassName} w-16 text-center`}
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={perfB[player.id] ?? 5}
                      onChange={(event) =>
                        setPerfB((prev) => ({
                          ...prev,
                          [player.id]: Number(event.target.value || 5),
                        }))
                      }
                      className={`${compactFieldClassName} w-16 text-center`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`mt-2 text-center font-semibold rounded px-2 py-1 ${
                teamBScore === totalGoalsB ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}
            >
              Total: {totalGoalsB} goles
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">Encargado de camisetas</div>
              <div className="text-gray-800">
                {(() => {
                  const name = shirtsResponsibleId
                    ? (players.find((player) => player.id === shirtsResponsibleId)?.name ?? '—')
                    : 'Seleccione un jugador'
                  return name
                })()}
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <select
                  className={selectClassName}
                  value={shirtsResponsibleId ?? ''}
                  onChange={(event) => setShirtsResponsibleId(event.target.value || null)}
                >
                  <option disabled={!!shirtsResponsibleId} value="">
                    Seleccione un Jugador
                  </option>
                  {(() => {
                    const current = [...teamA, ...teamB]
                    const eligibleExists = current.some((pp) => playedBefore.has(pp.id))
                    return current.map((player) => (
                      <option
                        key={player.id}
                        value={player.id}
                        disabled={eligibleExists && !playedBefore.has(player.id)}
                      >
                        {player.name} (#{dutiesById.get(player.id) ?? 0})
                        {eligibleExists && !playedBefore.has(player.id) ? ' — nuevo' : ''}
                      </option>
                    ))
                  })()}
                </select>
                <Chevron select />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold flex items-center gap-1.5">
                <span aria-hidden="true">🏆</span>
                MVP del partido
              </div>
              <div className="text-gray-800">
                {mvpId
                  ? (players.find((player) => player.id === mvpId)?.name ?? '—')
                  : 'Opcional — elegí al jugador del partido'}
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <select
                  className={selectClassName}
                  value={mvpId ?? ''}
                  onChange={(event) => setMvpId(event.target.value || null)}
                >
                  <option value="">Sin MVP</option>
                  {(() => {
                    const current = [...teamA, ...teamB]
                    const topPerfId = (() => {
                      const all = [
                        ...current.map((player) => ({
                          id: player.id,
                          perf: perfA[player.id] ?? perfB[player.id] ?? 0,
                        })),
                      ]
                      return all.sort((statA, statB) => statB.perf - statA.perf)[0]?.id
                    })()
                    return current.map((player) => {
                      const perf = perfA[player.id] ?? perfB[player.id] ?? 0
                      const goals = goalsA[player.id] ?? goalsB[player.id] ?? 0
                      const isSuggested = player.id === topPerfId && perf > 0
                      return (
                        <option key={player.id} value={player.id}>
                          {player.name} — ⚽ {goals} · ★ {perf}
                          {isSuggested ? ' · sugerido' : ''}
                        </option>
                      )
                    })
                  })()}
                </select>
                <Chevron select />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 bg-primary/5 border border-primary/20 rounded p-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-sm">
              <div className="font-semibold flex items-center gap-1.5">
                <span aria-hidden="true">🧤</span>
                Arqueros
              </div>
              <div className="text-gray-800">Marcá quién atajó (máximo {MAX_GOALKEEPERS})</div>
            </div>
            <span className="text-sm px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0">
              {goalkeeperIds.length} / {MAX_GOALKEEPERS}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...teamA, ...teamB].length === 0 ? (
              <span className="text-sm text-gray-600">Asigná jugadores a los equipos para elegir arqueros.</span>
            ) : (
              [...teamA, ...teamB].map((player) => {
                const active = goalkeeperIds.includes(player.id)
                const disabled = !active && goalkeeperIds.length >= MAX_GOALKEEPERS
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => toggleGoalkeeper(player.id)}
                    disabled={disabled}
                    aria-pressed={active}
                    className={`text-sm px-3 py-1 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      active
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    🧤 {player.name}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          {isDraft && (
            <Button variant="secondary" disabled={!canUpdateDraft || isLoading} onClick={() => handleSave('draft')}>
              {isLoading ? 'Actualizando...' : 'Actualizar borrador'}
            </Button>
          )}
          <Button disabled={!canConfirm || isLoading} onClick={() => handleSave('final')}>
            {isLoading
              ? isDraft
                ? 'Confirmando...'
                : mode === 'edit'
                  ? 'Actualizando...'
                  : 'Guardando...'
              : isDraft
                ? 'Confirmar partido'
                : mode === 'edit'
                  ? 'Actualizar Partido'
                  : 'Guardar Partido'}
          </Button>
        </div>
    </div>
  )
}
