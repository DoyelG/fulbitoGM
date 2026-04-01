import type { Match, MatchPlayer } from '@fulbito/types'
import { Paragraph, XStack, YStack } from 'tamagui'
import { FulbitoCard } from './FulbitoCard'

type Props = {
  match: Match
  shirtResponsibleName?: string | null
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export function MatchHistoryCard({ match, shirtResponsibleName }: Props) {
  const aWins = match.teamAScore > match.teamBScore
  const bWins = match.teamBScore > match.teamAScore

  return (
    <FulbitoCard borderLeftWidth={4} borderLeftColor="$color.indigo" shadowOpacity={0.06}>
      <XStack justifyContent="space-between" alignItems="flex-start" marginBottom={12} flexWrap="wrap" gap={8}>
        <YStack flex={1} minWidth={160} gap={6}>
          {match.name ? (
            <Paragraph fontSize={18} fontWeight="700" color="$color.black">
              {match.name}
            </Paragraph>
          ) : null}
          <XStack gap={8} alignItems="center" flexWrap="wrap">
            <Paragraph fontSize={15} fontWeight="600" color="$color.textSecondary">
              {formatDate(match.date)}
            </Paragraph>
            <YStack backgroundColor="$color.indigo" paddingHorizontal={8} paddingVertical={3} borderRadius={6}>
              <Paragraph color="$color.white" fontSize={12} fontWeight="600">
                {match.type}
              </Paragraph>
            </YStack>
          </XStack>
        </YStack>
        <Paragraph fontSize={22} fontWeight="800" color="$color.score">
          {match.teamAScore} - {match.teamBScore}
        </Paragraph>
      </XStack>

      <XStack gap={12} flexWrap="wrap" justifyContent="center" alignItems="center">
        <TeamBlock
          label="Equipo A"
          players={match.teamA}
          highlight={aWins ? 'win' : bWins ? 'lose' : 'neutral'}
        />
        <Paragraph fontWeight="800" alignSelf="center" color="$color.subtle" paddingVertical={8} fontSize={14}>
          VS
        </Paragraph>
        <TeamBlock
          label="Equipo B"
          players={match.teamB}
          highlight={bWins ? 'win' : aWins ? 'lose' : 'neutral'}
        />
      </XStack>

      {match.shirtsResponsibleId && shirtResponsibleName ? (
        <XStack gap={6} alignItems="center" marginTop={12} flexWrap="wrap">
          <Paragraph fontSize={13} color="$color.muted">
            Camisetas:
          </Paragraph>
          <Paragraph fontSize={13} fontWeight="600" color="$color.textSecondary">
            {shirtResponsibleName}
          </Paragraph>
        </XStack>
      ) : null}
    </FulbitoCard>
  )
}

function TeamBlock({
  label,
  players,
  highlight,
}: {
  label: string
  players: MatchPlayer[]
  highlight: 'win' | 'lose' | 'neutral'
}) {
  return (
    <YStack
      flex={1}
      minWidth={140}
      backgroundColor={
        highlight === 'win'
          ? '$color.winColumnBg'
          : highlight === 'lose'
            ? '$color.loseColumnBg'
            : '$color.sheet'
      }
      padding={12}
      borderRadius={8}
    >
      <Paragraph fontSize={13} fontWeight="700" color="$color.black" textAlign="center" marginBottom={8}>
        {label}
      </Paragraph>
      {players.map((p) => (
        <XStack
          key={p.id}
          justifyContent="space-between"
          paddingVertical={6}
          borderBottomWidth={1}
          borderBottomColor="$color.border"
          gap={8}
        >
          <Paragraph fontSize={14} color="$color.textSecondary" flex={1} numberOfLines={2}>
            {p.name}
          </Paragraph>
          <Paragraph fontSize={13} color="$color.muted">
            {p.goals}⚽ {p.performance}★
          </Paragraph>
        </XStack>
      ))}
    </YStack>
  )
}
