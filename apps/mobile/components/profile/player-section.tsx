import Feather from '@expo/vector-icons/Feather'
import { updatePlayer, uploadPlayerPhoto } from '@fulbito/firebase'
import type { Match, MyMatchEntry, Player } from '@fulbito/types'
import {
  calculateCurrentStreakForPlayer,
  computePersonalSummary,
  getPlayerMatchSummary,
  getPositionLabel,
} from '@fulbito/utils'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { usePickPhoto } from '@/hooks/use-pick-photo'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './player-section.styles'

const PLACEHOLDER = require('@/assets/images/user-placeholder.png')

type Props = {
  player: Player
  matches: Match[]
  entries?: MyMatchEntry[]
  isPersonal?: boolean
  index: number
  onPhotoChanged: () => void
}

function PlayerPhotoButton({ player, onPhotoChanged }: { player: Player; onPhotoChanged: () => void }) {
  const { colors } = useAppTheme()
  const pickPhoto = usePickPhoto()
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const displayedPhoto = preview ?? player.photoUrl

  const handlePress = async () => {
    const uri = await pickPhoto()
    if (!uri) return
    setPreview(uri)
    setErrorMessage(null)
    setIsUploading(true)
    try {
      const blob = await (await fetch(uri)).blob()
      const photoUrl = await uploadPlayerPhoto(blob, player.tournamentId, player.id)
      await updatePlayer(player.id, { photoUrl })
      onPhotoChanged()
    } catch {
      setPreview(null)
      setErrorMessage('No se pudo cambiar la foto. Probá de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <View style={styles.photoColumn}>
      <Pressable
        onPress={() => void handlePress()}
        disabled={isUploading}
        style={styles.photoButton}
        accessibilityRole="button"
        accessibilityLabel={`Cambiar foto de ${player.name}`}
        accessibilityState={{ disabled: isUploading, busy: isUploading }}
      >
        <View style={[styles.photoFrame, { backgroundColor: colors.chipBg, borderColor: colors.primarySoftStrong }]}>
          <Image
            source={displayedPhoto ? { uri: displayedPhoto } : PLACEHOLDER}
            contentFit="cover"
            style={styles.photo}
            accessible={false}
          />
          {isUploading && (
            <View style={[styles.photoOverlay, { backgroundColor: colors.onAccentSoft }]}>
              <ActivityIndicator color={colors.primary} accessibilityLabel="Subiendo foto" />
            </View>
          )}
        </View>
        <View style={[styles.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
          <Feather name="camera" size={14} color={colors.onPrimary} />
        </View>
      </Pressable>
      {errorMessage && (
        <Text style={[styles.photoError, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      )}
    </View>
  )
}

export function PlayerSection({ player, matches, entries, isPersonal = false, index, onPhotoChanged }: Props) {
  const { colors } = useAppTheme()
  const personal = useMemo(() => (entries ? computePersonalSummary(entries) : null), [entries])
  const matchSummary = useMemo(() => getPlayerMatchSummary(matches, player.id), [matches, player.id])
  const matchStreak = useMemo(() => calculateCurrentStreakForPlayer(matches, player.id), [matches, player.id])
  const summary = personal ?? matchSummary
  const streak = personal?.streak ?? matchStreak
  const hasStreak = streak.kind !== null && streak.count > 0
  const streakValue = hasStreak ? `${streak.kind === 'win' ? 'W' : 'L'}${streak.count}` : '—'
  const streakDescription = hasStreak
    ? `${streak.count} ${streak.kind === 'win' ? 'ganados' : 'perdidos'} seguidos`
    : 'sin racha'
  const stats = [
    { label: 'Partidos', value: String(summary.matches), spoken: String(summary.matches) },
    { label: 'Goles', value: String(summary.goals), spoken: String(summary.goals) },
    { label: 'Victorias', value: `${summary.winRate}%`, spoken: `${summary.winRate}%` },
    { label: 'Racha', value: streakValue, spoken: streakDescription },
  ]
  const position = getPositionLabel(player.position)
  const profileLabel = [
    isPersonal ? `Ver historia de ${player.name}` : `Ver perfil de ${player.name}`,
    position,
    ...stats.map((stat) => `${stat.label}: ${stat.spoken}`),
  ].join(', ')

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <PlayerPhotoButton player={player} onPhotoChanged={onPhotoChanged} />
      <Pressable
        onPress={() => router.push(isPersonal ? '/(tabs)/home' : `/(tabs)/players/${player.id}`)}
        style={styles.details}
        accessibilityRole="link"
        accessibilityLabel={profileLabel}
      >
        <View style={styles.headerRow}>
          <View style={styles.identity}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {player.name}
            </Text>
            <Text style={[styles.position, { color: colors.muted }]}>{position}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.primaryText} />
        </View>
        <View style={styles.stats}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.stat, { backgroundColor: colors.chipBg }]}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  )
}
