import { prisma } from '@/lib/prisma'
import { shapeStorePlayers } from '@/lib/shape'
import MatchClient from './matchClient'

export default async function MatchPage() {
  const players = await prisma.player.findMany({ orderBy: { name: 'asc' } })
  const shaped = shapeStorePlayers(players)
  return <MatchClient players={shaped} />
}