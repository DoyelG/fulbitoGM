import Feather from '@expo/vector-icons/Feather'
import type { MyTournament } from '@fulbito/types'
import { isTournamentAdminRole } from '@fulbito/utils'
import { Image } from 'expo-image'
import type { ComponentProps } from 'react'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { useAppTheme } from '@/hooks/use-theme'

import { RoleBadge } from './role-badge'
import { styles } from './tournament-card.styles'

type Props = {
  item: MyTournament
  active: boolean
  playerName: string | null
  onOpen: (item: MyTournament) => void
  onLinkPlayer: (item: MyTournament) => void
  onMembers: (item: MyTournament) => void
  onEdit: (item: MyTournament) => void
  onDelete: (item: MyTournament) => void
  onLeave: (item: MyTournament) => void
}

type CardActionProps = {
  icon: ComponentProps<typeof Feather>['name']
  label: string
  onPress: () => void
  tone?: 'default' | 'danger'
}

function CardAction({ icon, label, onPress, tone = 'default' }: CardActionProps) {
  const { colors, isDark } = useAppTheme()
  const dangerColor = isDark ? colors.dangerIcon : colors.danger
  const accentColor = colors.primaryText
  const color = tone === 'danger' ? dangerColor : accentColor

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.action, { backgroundColor: tone === 'danger' ? colors.dangerBg : colors.primarySoft }]}
    >
      <Feather name={icon} size={18} color={color} accessible={false} />
    </TouchableOpacity>
  )
}

export function TournamentCard({
  item,
  active,
  playerName,
  onOpen,
  onLinkPlayer,
  onMembers,
  onEdit,
  onDelete,
  onLeave,
}: Props) {
  const { colors, isDark, shadows } = useAppTheme()
  const { tournament, membership } = item
  const canEdit = isTournamentAdminRole(membership.role)
  const isOwner = membership.role === 'OWNER'
  const memberCount = tournament.memberUids.length
  const hasPlayer = membership.playerId !== null
  const accentColor = colors.primaryText

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: active ? colors.primaryText : colors.border,
        },
        shadows.card(isDark) as object,
      ]}
    >
      <Pressable
        onPress={() => onOpen(item)}
        accessibilityRole="button"
        accessibilityLabel={active ? `Ir a ${tournament.name}` : `Activar ${tournament.name}`}
        accessibilityState={{ selected: active }}
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <View style={[styles.photo, { backgroundColor: colors.primarySoft }]}>
          {tournament.photoUrl ? (
            <Image
              source={{ uri: tournament.photoUrl }}
              contentFit="cover"
              style={styles.photoImage}
              accessible={false}
            />
          ) : (
            <Feather name="award" size={26} color={accentColor} accessible={false} />
          )}
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
              {tournament.name}
            </Text>
            {active && (
              <View style={styles.activeBadge}>
                <PrimaryGradient />
                <Text style={[styles.activeText, { color: colors.onPrimary }]}>ACTIVO</Text>
              </View>
            )}
          </View>
          <RoleBadge role={membership.role} />
          {tournament.description && (
            <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
              {tournament.description}
            </Text>
          )}
        </View>
      </Pressable>

      <View style={[styles.stats, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => onMembers(item)}
          accessibilityRole="button"
          accessibilityLabel={`${memberCount} ${memberCount === 1 ? 'miembro' : 'miembros'}. Ver miembros`}
          style={[styles.stat, { backgroundColor: colors.chipBg }]}
        >
          <Feather name="users" size={14} color={accentColor} accessible={false} />
          <Text style={[styles.statText, { color: accentColor }]}>
            {memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onLinkPlayer(item)}
          disabled={hasPlayer}
          accessibilityRole="button"
          accessibilityLabel={hasPlayer ? `Tu jugador: ${playerName ?? ''}` : 'Sin jugador asignado. Vincular jugador'}
          accessibilityState={{ disabled: hasPlayer }}
          style={[styles.stat, { backgroundColor: colors.chipBg }]}
        >
          <Feather name={hasPlayer ? 'user-check' : 'link'} size={14} color={accentColor} accessible={false} />
          <Text style={[styles.statText, { color: hasPlayer ? colors.text : accentColor }]} numberOfLines={1}>
            {hasPlayer ? (playerName ?? 'Tu jugador') : 'Sin asignar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <CardAction icon="users" label={`Ver miembros de ${tournament.name}`} onPress={() => onMembers(item)} />
        {canEdit && <CardAction icon="edit-2" label={`Editar ${tournament.name}`} onPress={() => onEdit(item)} />}
        {isOwner ? (
          <CardAction
            icon="trash-2"
            label={`Eliminar ${tournament.name}`}
            onPress={() => onDelete(item)}
            tone="danger"
          />
        ) : (
          <CardAction
            icon="log-out"
            label={`Abandonar ${tournament.name}`}
            onPress={() => onLeave(item)}
            tone="danger"
          />
        )}
      </View>
    </View>
  )
}
