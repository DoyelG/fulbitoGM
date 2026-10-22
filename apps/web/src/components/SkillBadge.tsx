'use client'

const GOALKEEPER_LEVEL_SCALE = {
  hueLow: 200,
  hueHigh: 150,
  saturation: 72,
  lightnessLow: 42,
  lightnessHigh: 36,
}

export type ColorTweaks = { saturationScale?: number; lightnessOffset?: number }

const BADGE_CLASSES = 'inline-flex items-center px-2 py-0.5 rounded text-xs'
const SOFT_BACKGROUND_ALPHA = 0.1

function hsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue}deg ${saturation}% ${lightness}%)`
}

export function colorForSkill(skill: number, { saturationScale = 1, lightnessOffset = 0 }: ColorTweaks = {}) {
  if (skill <= 5) {
    const intensity = (Math.max(1, skill) - 1) / 4
    return hsl(24, 85 * saturationScale, 38 + 14 * intensity + lightnessOffset)
  }
  const intensity = (Math.min(10, skill) - 6) / 4
  return hsl(270, 78 * saturationScale, 50 - 14 * intensity + lightnessOffset)
}

export function colorForGoalkeeperSkill(skill: number) {
  const { hueLow, hueHigh, saturation, lightnessLow, lightnessHigh } = GOALKEEPER_LEVEL_SCALE
  const progress = (Math.min(10, Math.max(1, skill)) - 1) / 9
  return hsl(hueLow + (hueHigh - hueLow) * progress, saturation, lightnessLow + (lightnessHigh - lightnessLow) * progress)
}

type SkillBadgeProps = {
  skill: number | 'unknown'
  muted?: boolean
  isGoalkeeper?: boolean
  soft?: boolean
}

export default function SkillBadge({ skill, muted = false, isGoalkeeper = false, soft = false }: SkillBadgeProps) {
  if (skill === 'unknown') {
    return <span className={`${BADGE_CLASSES} bg-gray-200 text-gray-800`}>Unknown</span>
  }
  if (muted) {
    return <span className={`${BADGE_CLASSES} bg-gray-200 text-gray-500`}>Lv {skill}</span>
  }

  const color = isGoalkeeper ? colorForGoalkeeperSkill(skill) : colorForSkill(skill)
  const style = soft
    ? { backgroundColor: color.replace(/\)$/, ` / ${SOFT_BACKGROUND_ALPHA})`), color }
    : { backgroundColor: color }

  return (
    <span className={`${BADGE_CLASSES} ${soft ? 'font-medium' : 'text-white'}`} style={style}>
      Lv {skill}
    </span>
  )
}
