import type { MatchPlayer } from '@fulbito/types'

const MAX_BALLS = 5
const BALL_DELAY_MS = 120

export default function TeamScorers({ scorers }: { scorers: MatchPlayer[] }) {
  if (scorers.length === 0) return null
  return (
    <ul className="space-y-1">
      {scorers.map((p) => (
        <li key={p.id} className="flex min-w-0 items-center justify-center gap-1.5 text-xs text-gray-200 sm:text-sm">
          <span className="truncate">{p.name}</span>
          <span className="flex shrink-0 tracking-tighter">
            {p.goals > MAX_BALLS ? (
              <span className="motion-safe:animate-ball-drop">⚽×{p.goals}</span>
            ) : (
              Array.from({ length: p.goals }, (_, i) => (
                <span
                  key={i}
                  className="inline-block motion-safe:animate-ball-drop"
                  style={{ animationDelay: `${i * BALL_DELAY_MS}ms` }}
                >
                  ⚽
                </span>
              ))
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
