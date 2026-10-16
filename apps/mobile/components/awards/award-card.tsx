import { Pressable, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

import { AwardRunnersUp } from '@/components/awards/award-runners-up'
import { ThemedText } from '@/components/themed-text'
import { PlayerAvatar } from '@/components/players/player-avatar'
import { useAppTheme } from '@/hooks/use-theme'
import type { AwardEntry } from '@fulbito/utils'
import type { AwardAccent, AwardIcon } from '@/hooks/use-annual-awards'
import { styles } from './award-card.styles'

type Props = {
  title: string
  subtitle: string
  icon: AwardIcon
  accent: AwardAccent
  winnerName: string
  winnerPhotoUrl?: string
  value: number
  unitLabel: string
  runnersUp: AwardEntry[]
  onPress: () => void
  onPressPlayer: (playerId: string) => void
}

export function AwardCard({
  title,
  subtitle,
  icon,
  accent,
  winnerName,
  winnerPhotoUrl,
  value,
  unitLabel,
  runnersUp,
  onPress,
  onPressPlayer,
}: Props) {
  const { colors, radii, isDark, shadows } = useAppTheme()

  const badgeBg = accent === 'brand' ? colors.brand : accent === 'secondary' ? colors.secondary : colors.chipBg
  const iconColor = accent === 'muted' ? colors.muted : '#ffffff'

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radii.xl,
        },
        shadows.card(isDark) as object,
      ]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ganador ${winnerName}, ${value} ${unitLabel}`}
        accessibilityHint="Abre el perfil del jugador"
        style={({ pressed }) => pressed && { opacity: 0.92 }}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <ThemedText style={[styles.title, { color: colors.text }]}>{title}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</ThemedText>
          </View>

          <View style={[styles.iconBadge, { backgroundColor: badgeBg, borderRadius: radii.md }]}>
            {icon.lib === 'ionicons' ? (
              <Ionicons name={icon.name} size={22} color={iconColor} />
            ) : (
              <MaterialCommunityIcons name={icon.name} size={22} color={iconColor} />
            )}
          </View>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.border }]} />

        <View style={styles.winnerRow}>
          <PlayerAvatar name={winnerName} photoUrl={winnerPhotoUrl} size={44} />

          <ThemedText numberOfLines={1} style={styles.name}>
            {winnerName}
          </ThemedText>

          <View style={styles.value}>
            <ThemedText style={[styles.valueText, { color: colors.secondary }]}>{value}</ThemedText>
            <ThemedText style={[styles.valueLabel, { color: colors.muted }]}>{unitLabel}</ThemedText>
          </View>
        </View>
      </Pressable>

      <AwardRunnersUp entries={runnersUp} unitLabel={unitLabel} onPressPlayer={onPressPlayer} />
    </View>
  )
}
