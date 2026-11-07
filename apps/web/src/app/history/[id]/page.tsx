'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { FiCheckCircle, FiEdit2 } from 'react-icons/fi'
import { teamTotals, winProbabilityA } from '@fulbito/utils'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { useMatchStore } from '@/store/useMatchStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { selectActiveTournament, selectMyPlayerId, useTournamentStore } from '@/store/useTournamentStore'
import { buildMatchImageData } from '@/lib/match-image-data'
import CopyMatchImageButton from '@/components/tournaments/detail/CopyMatchImageButton'
import DetailSection from '@/components/tournaments/detail/DetailSection'
import MatchHero from '@/components/matches/MatchHero'
import MatchTeamCard, { type TeamResult } from '@/components/matches/MatchTeamCard'
import MatchInfoPanel from '@/components/matches/MatchInfoPanel'
import MatchHighlightsPanel from '@/components/matches/MatchHighlightsPanel'
import TournamentCommentsBox from '@/components/matches/TournamentCommentsBox'
import VideoClipsSection from '@/components/videoClips/VideoClipsSection'
import Modal from '@/components/Modal'
import { RecordModal } from '../historyClient'

const ACTION_CLASS =
  'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

function teamResult(own: number, rival: number): TeamResult {
  if (own === rival) return 'draw'
  return own > rival ? 'win' : 'loss'
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const canManage = useCanManageTournament()
  const myPlayerId = useTournamentStore(selectMyPlayerId)
  const tournamentPhotoUrl = useTournamentStore(selectActiveTournament)?.tournament.photoUrl ?? null
  const { matches, matchesInit, initLoad: initMatchesLoad, updateMatch } = useMatchStore()
  const { players, playersInit, initLoad: initPlayersLoad } = usePlayerStore()
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (playersInit === 'idle') initPlayersLoad()
    if (matchesInit === 'idle') initMatchesLoad()
  }, [playersInit, matchesInit, initPlayersLoad, initMatchesLoad])

  const match = matches.find((row) => row.id === id) ?? null
  const playerById = useMemo(() => new Map(players.map((player) => [player.id, player])), [players])

  if (matchesInit !== 'loaded' && matchesInit !== 'error') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
        <span className="sr-only">Cargando partido…</span>
        <div aria-hidden className="h-56 animate-pulse rounded-3xl bg-gray-200" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <BackLink />
        <p role="alert" className="rounded-xl border border-gray-200 bg-white p-6 text-gray-800">
          {matchesInit === 'error' ? 'No se pudo cargar el partido.' : 'No encontramos este partido.'}
        </p>
      </div>
    )
  }

  const isDraft = match.status === 'draft'
  const goalkeeperIds = new Set(match.goalkeeperIds ?? [])
  const totalsA = teamTotals(match.teamA, playerById)
  const totalsB = teamTotals(match.teamB, playerById)
  const probabilityA = winProbabilityA(totalsA, totalsB)
  const isParticipant = [...match.teamA, ...match.teamB].some((player) => player.id === myPlayerId)
  const shared = { isDraft, goalkeeperIds, mvpId: match.mvpId ?? null }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <BackLink />
        <div className="flex flex-wrap gap-2">
          {isDraft && (
            <CopyMatchImageButton
              variant="action"
              className={`${ACTION_CLASS} bg-secondary text-night shadow-md shadow-secondary/30 hover:brightness-110`}
              data={buildMatchImageData(match, playerById, tournamentPhotoUrl)}
            />
          )}
          {canManage && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={`${ACTION_CLASS} bg-primary-gradient text-white hover:brightness-110`}
            >
              {isDraft ? (
                <FiCheckCircle className="h-4 w-4" aria-hidden />
              ) : (
                <FiEdit2 className="h-4 w-4" aria-hidden />
              )}
              {isDraft ? 'Completar resultado' : 'Editar partido'}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start">
        <div className="contents lg:col-span-2 lg:flex lg:flex-col lg:gap-5">
          <div className="order-1">
            <MatchHero match={match} tournamentPhotoUrl={tournamentPhotoUrl} />
          </div>
          <DetailSection id="match-teams-title" title="Equipos" icon={UserGroupIcon} className="order-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MatchTeamCard
                {...shared}
                title="Equipo A"
                players={match.teamA}
                result={isDraft ? null : teamResult(match.teamAScore, match.teamBScore)}
                totals={totalsA}
                winProbability={probabilityA}
                tone="primary"
              />
              <MatchTeamCard
                {...shared}
                title="Equipo B"
                players={match.teamB}
                result={isDraft ? null : teamResult(match.teamBScore, match.teamAScore)}
                totals={totalsB}
                winProbability={100 - probabilityA}
                tone="secondary"
              />
            </div>
          </DetailSection>
          <div className="order-4">
            <VideoClipsSection matchId={match.id} matches={matches} canUpload={canManage || isParticipant} />
          </div>
        </div>
        <div className="contents lg:flex lg:flex-col lg:gap-5">
          <div className="order-2">
            <MatchInfoPanel match={match} playerById={playerById} />
          </div>
          {!isDraft && (
            <div className="order-5">
              <MatchHighlightsPanel match={match} />
            </div>
          )}
          <div className="order-6">
            <TournamentCommentsBox />
          </div>
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar Resultado del Partido" size="large">
        <RecordModal
          mode="edit"
          initial={match}
          onClose={() => setEditing(false)}
          onSave={(input) => updateMatch(match.id, input)}
        />
      </Modal>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/history"
      className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-gray-700 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ArrowLeftIcon className="h-4 w-4" aria-hidden />
      Historial
    </Link>
  )
}
