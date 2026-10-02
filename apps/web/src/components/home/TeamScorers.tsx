import type { MatchPlayer } from '@fulbito/types'

const MAX_BALLS = 5

export default function TeamScorers({ scorers }: { scorers: MatchPlayer[] }) {
  if (scorers.length === 0) return null
  return (
    <ul className="space-y-1">
      {scorers.map((p) => (
        <li key={p.id} className="flex min-w-0 items-center justify-center gap-1.5 text-xs text-gray-200 sm:text-sm">
          <span className="truncate">{p.name}</span>
          <span className="shrink-0 tracking-tighter">
            {p.goals > MAX_BALLS ? `⚽×${p.goals}` : '⚽'.repeat(p.goals)}
          </span>
        </li>
      ))}
    </ul>
  )
}
