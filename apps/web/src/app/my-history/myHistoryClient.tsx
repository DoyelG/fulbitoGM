'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { UserIcon } from '@heroicons/react/24/outline'
import { FiTrash2 } from 'react-icons/fi'
import { buildPersonalHistory } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { useTournamentStore, selectPersonalTournament } from '@/store/useTournamentStore'
import { useMyMatchEntries } from '@/hooks/use-my-match-entries'
import { useMyVideoClips } from '@/hooks/use-my-video-clips'
import { selectClassName } from '@/lib/field-styles'
import { buttonClasses } from '@/components/Button'
import ConfirmModal from '@/components/ConfirmModal'
import EmptyState from '@/components/EmptyState'
import PageTitle from '@/components/PageTitle'
import { Card } from '@/components/Card'
import WorldCupGoalCard from '@/components/personal/WorldCupGoalCard'
import MyPlayerSection from '@/components/personal/MyPlayerSection'
import PersonalRecentMatches, { RECENT_MATCHES_PAGE_SIZE } from '@/components/personal/PersonalRecentMatches'
import PersonalStatsGrid from '@/components/personal/PersonalStatsGrid'
import VideoClipsSection from '@/components/videoClips/VideoClipsSection'

export default function MyHistoryClient() {
  const myTournaments = useTournamentStore((state) => state.myTournaments)
  const init = useTournamentStore((state) => state.myTournamentsInit)
  const setActiveTournament = useTournamentStore((state) => state.setActiveTournament)
  const personal = useTournamentStore(selectPersonalTournament)
  const activeTournamentId = useTournamentStore((state) => state.activeTournamentId)
  const matches = useMatchStore((state) => state.matches)
  const initMatches = useMatchStore((state) => state.initLoad)
  const { state: entriesState, removeMatch } = useMyMatchEntries(myTournaments)
  const deleteMatch = useMatchStore((state) => state.deleteMatch)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [year, setYear] = useState<number | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(RECENT_MATCHES_PAGE_SIZE)
  const personalId = personal?.tournament.id ?? null
  const playerId = personal?.membership.playerId ?? null
  const isPersonalActive = personalId !== null && activeTournamentId === personalId

  const hasActivatedPersonal = useRef(false)
  useEffect(() => {
    if (!personalId || hasActivatedPersonal.current) return
    hasActivatedPersonal.current = true
    if (activeTournamentId !== personalId) setActiveTournament(personalId)
  }, [personalId, activeTournamentId, setActiveTournament])

  useEffect(() => {
    if (isPersonalActive) void initMatches()
  }, [isPersonalActive, initMatches])

  const allEntries = useMemo(() => (entriesState.status === 'ready' ? entriesState.entries : []), [entriesState])
  const { run, years, summary, sortedEntries } = useMemo(
    () => buildPersonalHistory(allEntries, year),
    [allEntries, year],
  )
  const otherClips = useMyVideoClips(myTournaments, isPersonalActive)
  const externalMatches = useMemo(() => allEntries.map(({ match }) => match), [allEntries])
  const tournamentNames = useMemo(
    () => new Map(myTournaments.map(({ tournament }) => [tournament.id, tournament.name])),
    [myTournaments],
  )

  if (init !== 'loaded') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-busy="true" aria-live="polite">
        <PageTitle>Mi historia</PageTitle>
        <div className="h-40 rounded-2xl bg-gray-200 animate-pulse" aria-hidden />
      </div>
    )
  }

  if (!personal) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTitle>Mi historia</PageTitle>
        <EmptyState
          icon={UserIcon}
          title="Todavía no tenés una historia personal"
          description="Creá tu torneo personal para registrar tus propios partidos, goles y clips, y fijar tu objetivo de Mundial."
          action={{ label: 'Crear mi historia', href: '/tournaments' }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle>Mi historia</PageTitle>

      {entriesState.status === 'loading' && (
        <div className="mb-6 h-40 rounded-2xl bg-gray-200 animate-pulse" aria-busy="true" aria-hidden />
      )}
      {entriesState.status === 'error' && (
        <p role="alert" className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          No se pudo calcular tu racha. Intentá de nuevo más tarde.
        </p>
      )}
      {playerId && isPersonalActive && <MyPlayerSection playerId={playerId} />}

      {entriesState.status === 'ready' && <WorldCupGoalCard personal={personal} run={run} />}

      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/match" className={buttonClasses()}>
          Registrar partido
        </Link>
      </div>

      {entriesState.status === 'ready' && years.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <label htmlFor="my-history-year" className="text-sm font-medium">
            Año
          </label>
          <select
            id="my-history-year"
            value={year}
            onChange={(event) => {
              setYear(event.target.value === 'all' ? 'all' : Number(event.target.value))
              setVisibleCount(RECENT_MATCHES_PAGE_SIZE)
            }}
            className={`${selectClassName} max-w-40`}
          >
            <option value="all">Todos</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      )}

      <section aria-label="Mis estadísticas" aria-busy={entriesState.status === 'loading'} className="mb-6">
        <h2 className="mb-3 text-xl font-bold">Mis estadísticas</h2>
        {entriesState.status === 'error' && (
          <p role="alert" className="text-sm text-orange-800">
            No se pudieron cargar tus partidos.
          </p>
        )}
        {entriesState.status === 'loading' && <div className="h-24 rounded-xl bg-gray-200 animate-pulse" aria-hidden />}
        {entriesState.status === 'ready' && <PersonalStatsGrid summary={summary} />}
      </section>

      {entriesState.status === 'ready' && (
        <Card padding={6} as="section" className="mb-6">
          <h2 className="mb-2 text-xl font-bold">Últimos partidos</h2>
          <PersonalRecentMatches
            entries={sortedEntries}
            visibleCount={visibleCount}
            onLoadMore={() => setVisibleCount((count) => count + RECENT_MATCHES_PAGE_SIZE)}
            personalTournamentId={personal.tournament.id}
            tournamentNames={tournamentNames}
            onOpenMatch={setActiveTournament}
            onDeleteMatch={setPendingDelete}
          />
          {deleteError && (
            <p role="alert" className="mt-3 text-sm text-orange-800">
              {deleteError}
            </p>
          )}
        </Card>
      )}

      {playerId && isPersonalActive && (
        <section aria-label="Mis clips">
          <VideoClipsSection
            playerId={playerId}
            matches={matches}
            canUpload
            extraClips={otherClips}
            extraMatches={externalMatches}
          />
        </section>
      )}
      <ConfirmModal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return
          setDeleteError(null)
          try {
            await deleteMatch(pendingDelete)
            removeMatch(pendingDelete)
          } catch {
            setDeleteError('No se pudo eliminar el partido. Intentá de nuevo.')
          } finally {
            setPendingDelete(null)
          }
        }}
        title="Eliminar partido"
        icon={FiTrash2}
        tone="danger"
        confirmVariant="danger"
        confirmLabel="Eliminar"
      >
        Vas a eliminar este partido de tu historia. Esta acción no se puede deshacer.
      </ConfirmModal>
    </div>
  )
}
