'use client'

import type { Match, Player } from '@fulbito/types'
import { useAnnualAwards } from '@/hooks/use-annual-awards'
import { AwardCard } from '@/components/AwardCard'
import { AWARD_ICONS } from '@/constants/award-icons'

type Props = { players: Player[]; matches: Match[] }

export function AwardsClient({ players, matches }: Props) {
  const { currentYear, availableYears, onSelectYear, winners } = useAnnualAwards(players, matches)

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Premios del Año</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="award-year" className="text-sm font-medium">
            Temporada
          </label>
          <select
            id="award-year"
            value={currentYear}
            onChange={(e) => onSelectYear(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {winners.length === 0 ? (
        <p className="text-gray-600 text-center py-16">Todavía no hay premios este año.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {winners.map((winner) => (
            <AwardCard
              key={winner.def.key}
              title={winner.def.title}
              subtitle={winner.def.subtitle}
              Icon={AWARD_ICONS[winner.def.key]}
              accent={winner.def.accent}
              winnerName={winner.row.name}
              winnerPhotoUrl={winner.row.photoUrl}
              value={winner.value}
              unitLabel={winner.def.unitLabel}
              href={`/players/${winner.row.id}`}
            />
          ))}
        </div>
      )}
    </main>
  )
}
