import type { Match } from '@fulbito/types'
import { formatLongMatchDate, formatMatchClock, openMatchSummary, parseMatchDate } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { OpenMatchSignupButton } from '@/components/match-detail/open-match-signup-button'
import { PrimaryGradient } from '@/components/primary-gradient'
import { Shadows } from '@/constants/theme'
import { useOpenMatch } from '@/hooks/use-open-match'

import { styles } from './home-next-match-card.styles'
import { openStyles } from './home-open-match-card.styles'

type Props = {
  match: Match
  onChanged: () => Promise<void>
}

export function HomeOpenMatchCard({ match, onChanged }: Props) {
  const router = useRouter()
  const controller = useOpenMatch(match, onChanged)
  const live = controller.match ?? match
  const { date, hour } = parseMatchDate(live)
  const longDate = formatLongMatchDate(date)
  const state = controller.state

  return (
    <View style={[styles.card, Shadows.card(false) as object]}>
      <PrimaryGradient />
      <Text style={styles.eyebrow} numberOfLines={1}>
        Abierto{live.name ? ` · ${live.name}` : ''}
      </Text>
      <Text style={styles.date} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit>
        {longDate.charAt(0).toUpperCase() + longDate.slice(1)}
      </Text>
      {hour !== null && <Text style={[styles.date, styles.time]}>{formatMatchClock(hour)}hs</Text>}
      {state && (
        <View style={openStyles.summaryRow} accessibilityLiveRegion="polite">
          <Text style={openStyles.summary}>{openMatchSummary(state)}</Text>
          <Text
            style={openStyles.count}
            accessibilityLabel={`${state.confirmed.length} de ${state.capacity} inscriptos`}
          >
            {state.confirmed.length}/{state.capacity}
          </Text>
        </View>
      )}
      <View style={openStyles.actions}>
        <OpenMatchSignupButton controller={controller} tone="dark" />
        <Pressable
          onPress={() => router.push({ pathname: '/(tabs)/history/[id]', params: { id: live.id } })}
          accessibilityRole="button"
          accessibilityLabel="Ver partido"
          style={({ pressed }) => [openStyles.secondaryBtn, pressed && styles.pressed]}
        >
          <Text style={openStyles.secondaryText}>Ver partido</Text>
        </Pressable>
      </View>
    </View>
  )
}
