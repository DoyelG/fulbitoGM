import { prisma } from '@/lib/prisma'
import MatchClient from './matchClient'
import type { Player as StorePlayer } from '@/store/usePlayerStore'

export default async function MatchPage() {
  const players = await prisma.player.findMany({ orderBy: { name: 'asc' } })
  const shaped: StorePlayer[] = players.map(p => ({
    id: p.id,
    name: p.name,
    position: p.position,
    skill: p.skill ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))
  return <MatchClient players={shaped} />
}