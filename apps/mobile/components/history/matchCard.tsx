import Feather from '@expo/vector-icons/Feather'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import type { Match, Player } from '@fulbito/types'
import { formatMatchDate, formatMatchHour, parseMatchDate, matchLocationMapsUrl } from '@fulbito/utils'
import { Pressable, StyleSheet, Text, TouchableOpacity, View, Linking} from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'
import { useState } from 'react'
import { ContrastColors } from '@/constants/theme'

type MatchPlayer = Match['teamA'][number]

type Props = {
  match: Match
  players: Player[]
  canManage: boolean
  clipCount: number
  onEdit: () => void
  onDelete: () => void
  onViewClips: () => void
}

export function MatchCard({
  match,
  players,
  canManage,
  clipCount,
  onEdit,
  onDelete,
  onViewClips,
}: Props) {
  const { colors, radii, spacing, shadows, isDark } = useAppTheme()

  const winA = match.teamAScore > match.teamBScore
  const winB = match.teamBScore > match.teamAScore
  const { date: matchDay, hour } = parseMatchDate(match)

  const shirtName = match.shirtsResponsibleId
    ? (players.find((player) => player.id === match.shirtsResponsibleId)?.name ?? '—')
    : null

  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExtended = () => {
    setIsExpanded((isOpen) => !isOpen)
  }

  return (
    <TouchableOpacity
      activeOpacity={canManage ? 0.85 : 1}
      disabled={!canManage}
      onPress={onEdit}
      accessibilityRole={canManage ? 'button' : undefined}
      accessibilityLabel={canManage ? 'Editar partido' : undefined}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderRadius: radii.md },
        shadows.card(isDark),
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {match.name ? (
            <Text style={[styles.matchName, { color: colors.text }]}>{match.name}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <Text style={[styles.date, { color: colors.text }]}>{formatMatchDate(matchDay)}</Text>
            {hour !== null && (
              <Text style={[styles.date, { color: colors.text }]}>{formatMatchHour(hour)}</Text>
            )}
            <View style={[styles.typeBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.typeBadgeText}>{match.type}</Text>
            </View>
            {match.isFriendly && (
              <View style={[styles.typeBadge, { backgroundColor: colors.friendlyBrand }]}>
                <Text style={styles.typeBadgeText}>Amistoso</Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.score, { color: colors.primaryText }]}>
            {match.teamAScore} – {match.teamBScore}
          </Text>
        </View>
      </View>

      <View style={styles.teamsRow}>
        <TeamColumn
          label="Equipo A"
          players={match.teamA}
          winner={winA}
          loser={winB}
          goalkeeperIds={match.goalkeeperIds}
          mvpId={match.mvpId}
          colors={colors}
          radii={radii}
          spacing={spacing}
        />
        <TeamColumn
          label="Equipo B"
          players={match.teamB}
          winner={winB}
          loser={winA}
          goalkeeperIds={match.goalkeeperIds}
          mvpId={match.mvpId}
          colors={colors}
          radii={radii}
          spacing={spacing}
        />
      </View>

      {match.description ? (
        <Pressable
          onPress={toggleExtended}
          onStartShouldSetResponderCapture={() => true}
          style={styles.descriptionRow}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? 'Contraer descripción' : 'Expandir descripción'}
          accessibilityState={{ expanded: isExpanded }}
        >
          <Text
            style={[styles.description, { color: colors.muted }]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {match.description}
          </Text>
          <Text
            style={[
              styles.chevron,
              { color: colors.primaryAccent },
              { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
            ]}
          >
            ^
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.footer}>
        {match.location?.name ? (
          <TouchableOpacity
            onPress={() => match.location && Linking.openURL(matchLocationMapsUrl(match.location))}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            accessibilityRole="link"
            accessibilityLabel={`Ubicación: ${match.location.name}, ${match.location.street}`}
            accessibilityHint="Abre la cancha en Google Maps"
            style={styles.location}
          >
            <Text style={[styles.shirts, { color: colors.muted }]}>
              Ubicación:{' '}
              <Text style={[styles.locationName, { color: colors.primaryText }]}>{match.location.name}</Text>
            </Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.actions}>
          {shirtName ? (
            <View style={styles.shirtsRow} accessible accessibilityLabel={`Camisetas: ${shirtName}`}>
              <MaterialCommunityIcons name="washing-machine" size={20} color={colors.primaryText} accessible={false} />
              <Text style={[styles.shirts, styles.shirtsName, { color: colors.text }]} numberOfLines={1}>
                {shirtName}
              </Text>
            </View>
          ) : null}
          <TouchableOpacity
            onPress={onViewClips}
            style={[styles.actionBtn, { backgroundColor: colors.primarySoft }]}
            accessibilityRole="button"
            accessibilityLabel={`Ver clips del partido${match.name ? `: ${match.name}` : ''}`}>
            <Feather name="video" size={18} color={colors.primaryText} accessible={false} />
            {clipCount > 0 && (
              <View style={[styles.clipCountBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.clipCountBadgeText}>{clipCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {canManage && (
            <>
              <TouchableOpacity
                onPress={onEdit}
                style={[styles.actionBtn, { backgroundColor: colors.primarySoft }]}
                accessibilityRole="button"
                accessibilityLabel="Editar partido">
                <Feather name="edit-2" size={18} color={colors.primaryText} accessible={false} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDelete}
                style={[styles.actionBtn, { backgroundColor: colors.dangerBg }]}
                accessibilityRole="button"
                accessibilityLabel="Eliminar partido">
                <Feather name="trash-2" size={18} color={isDark ? colors.dangerIcon : colors.danger} accessible={false} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

type TeamColumnColors = {
  surface: string
  text: string
  muted: string
  warning: string
  primarySubtle: string
  secondarySubtle: string
  neutralSubtle: string
}
type TeamColumnRadii = { sm: number }
type TeamColumnSpacing = { xs: number; sm: number; md: number }

function TeamColumn({
  label,
  players,
  winner,
  loser,
  goalkeeperIds,
  mvpId,
  colors,
  radii,
  spacing,
}: {
  label: string
  players: MatchPlayer[]
  winner: boolean
  loser: boolean
  goalkeeperIds?: string[]
  mvpId?: string | null
  colors: TeamColumnColors
  radii: TeamColumnRadii
  spacing: TeamColumnSpacing
}) {
  const bg = winner ? colors.primarySubtle : loser ? colors.secondarySubtle : colors.neutralSubtle
  return (
    <View style={[styles.teamCol, { backgroundColor: bg, borderRadius: radii.sm, padding: spacing.sm }]}>
      <Text style={[styles.teamLabel, { color: colors.text }]}>{label}</Text>
      {players.map((player) => (
        <View key={player.id} style={styles.playerRow}>
          <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={[styles.playerStats, { color: colors.muted }]}>
            {goalkeeperIds?.includes(player.id) ? '🧤 ' : ''}{mvpId === player.id ? '🏆 ' : ''}{player.goals}⚽{' '}
            {player.performance}★
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  matchName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: ContrastColors.onColor,
    fontSize: 11,
    fontWeight: '700',
  },
  scoreBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  teamCol: {
    flex: 1,
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ContrastColors.dividerOnLightSoft,
  },
  playerName: {
    fontSize: 13,
    flex: 1,
    marginRight: 4,
  },
  playerStats: {
    fontSize: 12,
  },
  footer: {
    marginTop: 8,
    gap: 8,
  },
  shirtsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shirtsName: {
    flexShrink: 1,
    fontWeight: '600',
  },
  shirts: {
    fontSize: 12,
  },
  location: {
    alignSelf: 'flex-start',
  },
  locationName: {
    fontWeight: '600',
  },
  descriptionRow: {
    gap: 6,
    marginTop: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  description: {
    flex: 1,
    flexShrink: 1,
    fontSize: 12,
  },
  chevron: {
    fontSize: 12,
    fontWeight: '700',
    alignSelf: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 999,
    paddingHorizontal: 5,
    minWidth: 16,
    alignItems: 'center',
  },
  clipCountBadgeText: {
    color: ContrastColors.onColor,
    fontSize: 10,
    fontWeight: '700',
  },
})
