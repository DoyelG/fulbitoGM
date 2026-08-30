import { FaceFrownIcon, StarIcon } from '@heroicons/react/24/outline'
import { FaRunning } from 'react-icons/fa'
import { GiSoccerBall, GiWashingMachine } from 'react-icons/gi'
import type { AwardKey } from '@fulbito/utils'
import type { ComponentType } from 'react'

export const AWARD_ICONS: Record<AwardKey, ComponentType<{ className?: string }>> = {
  matches: FaRunning,
  goals: GiSoccerBall,
  lossStreak: FaceFrownIcon,
  shirts: GiWashingMachine,
  mvps: StarIcon,
}
