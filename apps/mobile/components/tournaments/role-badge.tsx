import type { TournamentRole } from '@fulbito/types'
import { TOURNAMENT_ROLE_LABELS } from '@fulbito/utils'
import { Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './role-badge.styles'

export function RoleBadge({ role }: { role: TournamentRole }) {
  const { colors } = useAppTheme()
  const roleColors: Record<TournamentRole, { background: string; text: string }> = {
    OWNER: { background: colors.primarySoft, text: colors.primaryText },
    ADMIN: { background: colors.chipBg, text: colors.secondary },
    MEMBER: { background: colors.chipBg, text: colors.muted },
  }

  return (
    <View style={[styles.badge, { backgroundColor: roleColors[role].background }]}>
      <Text style={[styles.text, { color: roleColors[role].text }]}>{TOURNAMENT_ROLE_LABELS[role]}</Text>
    </View>
  )
}
