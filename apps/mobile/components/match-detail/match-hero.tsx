import type { Match } from '@fulbito/types'
import { formatLongMatchDate, getOpponentLabel, parseMatchDate } from '@fulbito/utils'
import { useState } from 'react'
import { Text, View, type TextLayoutEvent } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'

import { styles } from './match-hero.styles'

type Props = {
  match: Match
}

function balanceTwoLines(text: string): string {
  const middle = text.length / 2
  const spaces = [...text.matchAll(/ /g)].map((match) => match.index)
  if (spaces.length === 0) return text
  const split = spaces.reduce((best, index) => (Math.abs(index - middle) < Math.abs(best - middle) ? index : best))
  return `${text.slice(0, split)}\n${text.slice(split + 1)}`
}

function Badge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  )
}

export function MatchHero({ match }: Props) {
  const isDraft = match.status === 'draft'
  const { date } = parseMatchDate(match)
  const winA = !isDraft && match.teamAScore > match.teamBScore
  const winB = !isDraft && match.teamBScore > match.teamAScore
  const rawTitle = match.name || formatLongMatchDate(date)
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1)
  const [wrappedTitle, setWrappedTitle] = useState<string | null>(null)
  const isWrapped = wrappedTitle === title

  const handleTitleLayout = ({ nativeEvent }: TextLayoutEvent) => {
    if (!isWrapped && nativeEvent.lines.length > 1) setWrappedTitle(title)
  }

  return (
    <View style={styles.card}>
      <PrimaryGradient />
      <View style={styles.header}>
        <Text
          style={styles.title}
          numberOfLines={2}
          accessibilityRole="header"
          accessibilityLabel={title}
          onTextLayout={handleTitleLayout}
        >
          {isWrapped ? balanceTwoLines(title) : title}
        </Text>
        {match.isFriendly && <Badge label="Amistoso" />}
      </View>
      <View style={styles.scoreRow}>
        <Text style={[styles.team, winB ? styles.teamDim : null]} numberOfLines={1}>
          Equipo A
        </Text>
        <View
          style={styles.scoreBox}
          accessible
          accessibilityLabel={
            isDraft ? 'Sin resultado todavía' : `Resultado: ${match.teamAScore} a ${match.teamBScore}`
          }
        >
          <Text style={styles.score}>{isDraft ? '0 – 0' : `${match.teamAScore} – ${match.teamBScore}`}</Text>
        </View>
        <Text style={[styles.team, winA ? styles.teamDim : null]} numberOfLines={1}>
          {getOpponentLabel(match) ?? 'Equipo B'}
        </Text>
      </View>
    </View>
  )
}
