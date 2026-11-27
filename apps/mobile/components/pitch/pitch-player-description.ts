export type PitchPlayerDescription = {
  name: string
  position?: string
  teamLabel: string
  isMvp: boolean
  goals: number
}

export function describePitchPlayer(data: PitchPlayerDescription): string {
  const goals = data.goals > 0 ? `${data.goals} ${data.goals === 1 ? 'gol' : 'goles'}` : undefined
  return [data.name, data.position, data.teamLabel, goals, data.isMvp ? 'MVP del partido' : undefined]
    .filter(Boolean)
    .join(', ')
}
