import { Pressable, View } from 'react-native'
import type { HallOfFameEntry } from '@fulbito/utils'

import { PlayerAvatar } from '@/components/players/player-avatar'
import { ThemedText } from '@/components/themed-text'
import { CardColors, ChampionColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './hall-of-fame.styles'

type Props = {
  entries: HallOfFameEntry[]
  onPressPlayer: (playerId: string) => void
}

export function HallOfFame({ entries, onPressPlayer }: Props) {
  const { colors } = useAppTheme()

  return (
    <View>
      <View style={styles.intro}>
        <ThemedText style={[styles.title, { color: colors.text }]}>Hall of Fame</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.muted }]}>
          Los que llegaron a 7 victorias seguidas y se coronaron campeones.
        </ThemedText>
      </View>

      {entries.length === 0 ? (
        <View style={[styles.empty, { borderColor: CardColors.gold.light, backgroundColor: ChampionColors.goldSoft }]}>
          <ThemedText style={[styles.emptyText, { color: colors.text }]}>
            Nadie pudo pasar a la eternidad, sé el primero.
          </ThemedText>
        </View>
      ) : (
        entries.map((entry) => (
          <View key={entry.year}>
            <ThemedText style={[styles.yearLabel, { color: CardColors.gold.mid }]}>{entry.year}</ThemedText>
            {entry.champions.map((champion) => (
              <Pressable
                key={champion.playerId}
                onPress={() => onPressPlayer(champion.playerId)}
                accessibilityRole="button"
                accessibilityLabel={`${champion.playerName}, campeón ${entry.year}`}
                accessibilityHint="Abre el perfil del jugador"
                style={({ pressed }) => [
                  styles.row,
                  { borderColor: CardColors.gold.light, backgroundColor: colors.surface },
                  pressed && { opacity: 0.8 },
                ]}>
                <View style={[styles.avatarRing, { borderColor: CardColors.gold.light }]}>
                  <PlayerAvatar name={champion.playerName} photoUrl={champion.playerPhotoUrl} size={44} />
                </View>
                <ThemedText numberOfLines={1} style={[styles.name, { color: colors.text }]}>
                  {champion.playerName}
                </ThemedText>
                <ThemedText style={[styles.meta, { color: CardColors.gold.dark }]}>
                  🏆 {champion.streak} victorias seguidas
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ))
      )}
    </View>
  )
}
