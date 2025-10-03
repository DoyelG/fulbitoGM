import { prisma } from '@/lib/prisma'
import MatchClient from './matchClient'

export default async function MatchPage() {
  const players = await prisma.player.findMany({ orderBy: { name: 'asc' } })
  const shaped = players.map(p => ({
    id: p.id,
    name: p.name,
    position: p.position,
    skill: (p.skill ?? 'unknown') as number | 'unknown',
  }))
  return <MatchClient players={shaped} />
}