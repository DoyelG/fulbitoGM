const MAX_BALLS = 5
const BALL_DELAY_MS = 120

export type GoalBallsProps = { goals: number; compact?: boolean }

export default function GoalBalls({ goals, compact = false }: GoalBallsProps) {
  if (goals <= 0) return null
  const label = goals === 1 ? '1 gol' : `${goals} goles`
  const showCount = goals > MAX_BALLS || (compact && goals > 1)
  return (
    <span role="img" aria-label={label} className="flex shrink-0 tracking-tighter">
      {showCount ? (
        <span className="motion-safe:animate-ball-drop">⚽×{goals}</span>
      ) : (
        Array.from({ length: goals }, (_, index) => (
          <span
            key={index}
            className="inline-block motion-safe:animate-ball-drop"
            style={{ animationDelay: `${index * BALL_DELAY_MS}ms` }}
          >
            ⚽
          </span>
        ))
      )}
    </span>
  )
}
