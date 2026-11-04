import Link from 'next/link'
import type { PlayerStatRow } from '@fulbito/utils'
import { StarIcon } from '@heroicons/react/24/outline'
import DetailSection from './DetailSection'

type Props = {
  rows: PlayerStatRow[]
}

type Board = {
  title: string
  unit: [string, string]
  value: (row: PlayerStatRow) => number
}

const BOARDS: Board[] = [
  { title: 'Goleadores', unit: ['gol', 'goles'], value: (row) => row.goals },
  { title: 'Más partidos', unit: ['partido', 'partidos'], value: (row) => row.matches },
  { title: 'MVPs', unit: ['MVP', 'MVPs'], value: (row) => row.mvps },
  { title: 'Más victorias', unit: ['victoria', 'victorias'], value: (row) => row.wins },
]

const LEADERS_PER_BOARD = 3
const MEDAL_STYLES = [
  'bg-primary text-white',
  'bg-primary/15 text-primary',
  'bg-primary/5 text-primary ring-1 ring-inset ring-primary/30',
]

function topRows(rows: PlayerStatRow[], value: Board['value']): PlayerStatRow[] {
  return rows
    .filter((row) => value(row) > 0)
    .sort((a, b) => value(b) - value(a) || a.name.localeCompare(b.name))
    .slice(0, LEADERS_PER_BOARD)
}

export default function LeadersPanel({ rows }: Props) {
  return (
    <DetailSection
      id="leaders-title"
      title="Líderes"
      icon={StarIcon}
      action={{ label: 'Ver estadísticas', href: '/statistics' }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {BOARDS.map((board) => {
          const leaders = topRows(rows, board.value)
          return (
            <div key={board.title} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">{board.title}</h3>
              {leaders.length === 0 ? (
                <p className="text-sm italic text-gray-700">Sin datos todavía</p>
              ) : (
                <ol className="space-y-1.5">
                  {leaders.map((row, index) => {
                    const value = board.value(row)
                    return (
                      <li key={row.id} className="flex items-center gap-2 text-sm">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${MEDAL_STYLES[index]}`}
                          aria-label={`Puesto ${index + 1}`}
                        >
                          {index + 1}
                        </span>
                        <Link
                          href={`/players/${row.id}`}
                          className="min-w-0 flex-1 truncate font-medium text-gray-900 hover:text-primary hover:underline"
                        >
                          {row.name}
                        </Link>
                        <span className="shrink-0 text-gray-700">
                          <span className="font-semibold text-gray-900">{value}</span>{' '}
                          {value === 1 ? board.unit[0] : board.unit[1]}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>
          )
        })}
      </div>
    </DetailSection>
  )
}
