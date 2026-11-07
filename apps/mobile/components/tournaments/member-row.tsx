import Feather from '@expo/vector-icons/Feather'
import type { TournamentMember, TournamentRole } from '@fulbito/types'
import { canChangeMemberRole, canRemoveMember } from '@fulbito/utils'
import type { ComponentProps } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './member-row.styles'
import { RoleBadge } from './role-badge'

type Props = {
  member: TournamentMember
  currentUid: string
  currentRole: TournamentRole
  canManage: boolean
  playerName: string | null
  onAssignPlayer: (member: TournamentMember) => void
  onChangeRole: (member: TournamentMember) => void
  onRemove: (member: TournamentMember) => void
}

type RowActionProps = {
  icon: ComponentProps<typeof Feather>['name']
  label: string
  onPress: () => void
  tone?: 'default' | 'danger'
}

function RowAction({ icon, label, onPress, tone = 'default' }: RowActionProps) {
  const { colors } = useAppTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.action, { backgroundColor: tone === 'danger' ? colors.dangerBg : colors.primarySoft }]}
    >
      <Feather
        name={icon}
        size={16}
        color={tone === 'danger' ? colors.danger : colors.primaryText}
        accessible={false}
      />
    </TouchableOpacity>
  )
}

export function MemberRow({
  member,
  currentUid,
  currentRole,
  canManage,
  playerName,
  onAssignPlayer,
  onChangeRole,
  onRemove,
}: Props) {
  const { colors } = useAppTheme()
  const isSelf = member.uid === currentUid

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.info}>
        <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
          {member.email}
          {isSelf && <Text style={{ color: colors.muted }}> (vos)</Text>}
        </Text>
        <View style={styles.meta}>
          <RoleBadge role={member.role} />
          <Feather name="user" size={12} color={colors.muted} accessible={false} />
          <Text style={[styles.player, { color: playerName ? colors.text : colors.muted }]} numberOfLines={1}>
            {playerName ?? 'Sin jugador'}
          </Text>
        </View>
      </View>
      {canManage && (
        <View style={styles.actions}>
          <RowAction icon="link" label={`Cambiar jugador de ${member.email}`} onPress={() => onAssignPlayer(member)} />
          {canChangeMemberRole(currentRole, member.role) && (
            <RowAction icon="shield" label={`Cambiar rol de ${member.email}`} onPress={() => onChangeRole(member)} />
          )}
          {!isSelf && canRemoveMember(currentRole, member.role) && (
            <RowAction
              icon="trash-2"
              label={`Eliminar a ${member.email} del torneo`}
              onPress={() => onRemove(member)}
              tone="danger"
            />
          )}
        </View>
      )}
    </View>
  )
}
