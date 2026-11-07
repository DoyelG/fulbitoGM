import MembersClient from './membersClient'

export default async function TournamentMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MembersClient tournamentId={id} />
}
