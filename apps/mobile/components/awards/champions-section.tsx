import { LinearGradient } from 'expo-linear-gradient'
import { Pressable, View } from 'react-native'
import { CHAMPIONSHIP_THRESHOLD, type ChampionshipProgress, type SeasonChampion } from '@fulbito/utils'

import { PlayerAvatar } from '@/components/players/player-avatar'
import { ThemedText } from '@/components/themed-text'
import { CardColors, ChampionColors } from '@/constants/theme'
import { styles } from './champions-section.styles'

type Props = {
  championship: ChampionshipProgress
  champions: SeasonChampion[]
  seasonYear: number | null
  onPressPlayer: (playerId: string) => void
}

export function ChampionsSection({ championship, champions, seasonYear, onPressPlayer }: Props) {
  return (
    <LinearGradient
      colors={ChampionColors.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.section}>
      {seasonYear !== null && (
        <>
          <ThemedText style={[styles.label, { color: CardColors.gold.light }]}>CAMPEONES {seasonYear}</ThemedText>

          {champions.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: ChampionColors.onHeroMuted }]}>
              Nadie pudo coronarse y alcanzar la gloria esta temporada.
            </ThemedText>
          ) : (
            champions.map((champion) => (
              <Pressable
                key={champion.playerId}
                onPress={() => onPressPlayer(champion.playerId)}
                accessibilityRole="button"
                accessibilityLabel={`${champion.playerName}, campeón con ${champion.streak} victorias seguidas`}
                accessibilityHint="Abre el perfil del jugador"
                style={({ pressed }) => [styles.championRow, pressed && { opacity: 0.7 }]}>
                <View style={[styles.avatarRing, { borderColor: CardColors.gold.light }]}>
                  <PlayerAvatar name={champion.playerName} photoUrl={champion.playerPhotoUrl} size={56} />
                </View>
                <View style={styles.championText}>
                  <ThemedText numberOfLines={1} style={[styles.name, { color: ChampionColors.onHero }]}>
                    {champion.playerName}
                  </ThemedText>
                  <ThemedText style={[styles.meta, { color: CardColors.gold.light }]}>
                    🏆 {champion.streak} VICTORIAS SEGUIDAS
                  </ThemedText>
                </View>
              </Pressable>
            ))
          )}

          <View style={[styles.divider, { backgroundColor: ChampionColors.heroDivider }]} />
        </>
      )}

      <ThemedText style={[styles.label, { color: ChampionColors.onHeroDim }]}>CAMINO AL CAMPEONATO</ThemedText>

      {championship === null ? (
        <ThemedText style={[styles.emptyText, { color: ChampionColors.onHeroMuted }]}>
          Todavía nadie está en racha ganadora.
        </ThemedText>
      ) : (
        <Pressable
          onPress={() => onPressPlayer(championship.playerId)}
          accessibilityRole="button"
          accessibilityLabel={`${championship.playerName}, ${championship.streak} de ${CHAMPIONSHIP_THRESHOLD} victorias`}
          accessibilityHint="Abre el perfil del jugador"
          style={({ pressed }) => [styles.championRow, pressed && { opacity: 0.7 }]}>
          <View style={[styles.avatarRing, { borderColor: ChampionColors.heroRing }]}>
            <PlayerAvatar name={championship.playerName} photoUrl={championship.playerPhotoUrl} size={48} />
          </View>
          <View style={styles.championText}>
            <ThemedText numberOfLines={1} style={[styles.name, { color: ChampionColors.onHero }]}>
              {championship.playerName}
            </ThemedText>
            <ThemedText style={[styles.meta, { color: ChampionColors.onHero }]}>
              {championship.isChampion
                ? '🏆 CAMPEÓN'
                : `${championship.streak} DE ${CHAMPIONSHIP_THRESHOLD} VICTORIAS AL DÍA DE LA FECHA`}
            </ThemedText>
          </View>
        </Pressable>
      )}
    </LinearGradient>
  )
}
