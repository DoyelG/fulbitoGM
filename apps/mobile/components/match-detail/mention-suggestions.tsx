import type { MentionCandidate } from '@fulbito/utils'
import { Pressable, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './mention-suggestions.styles'

type Props = {
  suggestions: MentionCandidate[]
  onSelect: (candidate: MentionCandidate) => void
  placement?: 'below' | 'above'
}

export function MentionSuggestions({ suggestions, onSelect, placement = 'below' }: Props) {
  const { colors } = useAppTheme()
  if (suggestions.length === 0) return null

  return (
    <View
      style={[
        styles.list,
        placement === 'above' ? styles.above : styles.below,
        { backgroundColor: colors.surface, borderColor: colors.chipBorder },
      ]}
      accessibilityLabel="Sugerencias para mencionar"
      accessibilityLiveRegion="polite"
    >
      {suggestions.map((candidate) => (
        <Pressable
          key={candidate.handle}
          onPress={() => onSelect(candidate)}
          style={({ pressed }) => [styles.option, pressed ? { backgroundColor: colors.primarySoft } : null]}
          accessibilityRole="button"
          accessibilityLabel={`Mencionar a ${candidate.name}`}
        >
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {candidate.name}
          </Text>
          <Text style={[styles.handle, { color: colors.muted }]}>@{candidate.handle}</Text>
        </Pressable>
      ))}
    </View>
  )
}
