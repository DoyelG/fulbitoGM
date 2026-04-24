import { GoalDonePill } from '@/components/players/goal-done-pill'
import { GoalProgressBar } from '@/components/players/goal-progress-bar'

type Props = { winCount: number }

export function GoalSevenBar({ winCount }: Props) {
  if (winCount >= 7) return <GoalDonePill />
  return <GoalProgressBar current={winCount} max={7} />
}
