import MatchClient from './matchClient'

type Props = {
  searchParams: Promise<{ openMatchId?: string | string[] }>
}

export default async function MatchPage({ searchParams }: Props) {
  const { openMatchId } = await searchParams
  return <MatchClient players={[]} openMatchId={typeof openMatchId === 'string' ? openMatchId : null} />
}
