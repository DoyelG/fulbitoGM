'use client'

import type { Match, Player } from '@fulbito/types'
import { useAnnualAwards } from '@/hooks/use-annual-awards'

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

      <p className="text-gray-600">{winners.length} premios este año.</p>
    </main>
  )
}
