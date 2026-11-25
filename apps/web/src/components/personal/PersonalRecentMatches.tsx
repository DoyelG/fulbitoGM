import Link from 'next/link'
import { FiTrash2 } from 'react-icons/fi'
import Button from '@/components/Button'
import type { MyMatchEntry } from '@fulbito/types'
import {
  formatMatchDate,
  getEntryPlayer,
  getEntryResult,
  getOpponentLabel,
  parseMatchDate,
  type EntryResult,
} from '@fulbito/utils'

export const RECENT_MATCHES_PAGE_SIZE = 10

type Props = {
  entries: MyMatchEntry[]
  visibleCount: number
  onLoadMore: () => void
  personalTournamentId: string
  tournamentNames: Map<string, string>
  onOpenMatch: (tournamentId: string) => void
  onDeleteMatch: (matchId: string) => void
}

const RESULT_STYLES: Record<EntryResult, { label: string; className: string }> = {
  win: { label: 'Ganado', className: 'bg-emerald-100 text-emerald-900' },
  loss: { label: 'Perdido', className: 'bg-orange-100 text-orange-900' },
  draw: { label: 'Empatado', className: 'bg-gray-100 text-gray-900' },
}

export default function PersonalRecentMatches({
  entries,
  visibleCount,
  onLoadMore,
  personalTournamentId,
  tournamentNames,
  onOpenMatch,
  onDeleteMatch,
}: Props) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-700">No hay partidos para mostrar.</p>
  }

  const visibleEntries = entries.slice(0, visibleCount)

  return (
    <>
      <ul className="divide-y divide-gray-100">
        {visibleEntries.map((entry) => {
          const { match } = entry
          const result = RESULT_STYLES[getEntryResult(entry)]
          const played = getEntryPlayer(entry)
          const isOtherTournament = match.tournamentId !== personalTournamentId
          const opponent = getOpponentLabel(match)
          const detail = opponent ? `vs ${opponent}` : match.type
          return (
            <li key={match.id} className="flex items-center gap-2">
              <Link
                href={`/history/${match.id}`}
                onClick={() => onOpenMatch(match.tournamentId)}
                className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="w-28 text-sm text-gray-700">{formatMatchDate(parseMatchDate(match).date)}</span>
                <span className="font-semibold">
                  {match.teamAScore} – {match.teamBScore}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                  {detail}
                  {isOtherTournament && (
                    <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                      {tournamentNames.get(match.tournamentId) ?? 'Otro torneo'}
                    </span>
                  )}
                </span>
                <span className="text-sm text-gray-700" aria-label={`${played?.goals ?? 0} goles`}>
                  {played?.goals ?? 0}⚽
                </span>
                <span className="text-sm text-gray-700" aria-label={`Rendimiento ${played?.performance ?? 0}`}>
                  {played?.performance ?? 0}★
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${result.className}`}>
                  {result.label}
                </span>
              </Link>
              {!isOtherTournament && (
                <button
                  type="button"
                  onClick={() => onDeleteMatch(match.id)}
                  aria-label={`Eliminar partido del ${formatMatchDate(parseMatchDate(match).date)}`}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-orange-700 hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
                >
                  <FiTrash2 aria-hidden />
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-sm text-gray-700" role="status" aria-live="polite">
        Mostrando {visibleEntries.length} de {entries.length}
      </p>
      {entries.length > visibleCount && (
        <Button variant="secondary" className="mt-2" onClick={onLoadMore}>
          Ver más partidos
        </Button>
      )}
    </>
  )
}
