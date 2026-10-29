import TournamentDetailClient from './tournamentDetailClient'

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TournamentDetailClient tournamentId={id} />
}
