import type { SkillValue } from './common'

export type Skills = {
  physical: SkillValue
  technical: SkillValue
  tactical: SkillValue
  psychological: SkillValue
}

export type Player = {
  id: string
  name: string
  skill: number | null
  position: string
  skills?: Skills
  photoUrl?: string
  shirtDutiesCount?: number
  createdAt: Date
  updatedAt: Date
}

/** Minimal player shape used by team-balancing algorithms */
export type PlayerInfo = {
  id: string
  name: string
  skill: SkillValue
  position?: string
  physical?: SkillValue
}
