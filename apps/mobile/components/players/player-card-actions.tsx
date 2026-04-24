import Feather from '@expo/vector-icons/Feather'
import { Pressable, StyleSheet, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  isAdmin: boolean
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function PlayerCardActions({ isAdmin, onView, onEdit, onDelete }: Props) {
  const { colors, isDark } = useAppTheme()

  return (
    <View style={[styles.row, { borderTopColor: colors.border }]}>
      <ActionPill
        onPress={onView}
        backgroundColor={isDark ? colors.chipBg : colors.brandSoft}>
        <Feather name="eye" size={17} color={colors.icon} />
      </ActionPill>

      {isAdmin && (
        <>
          <ActionPill onPress={onEdit} backgroundColor={colors.brandSoft}>
            <Feather name="edit-2" size={17} color={colors.brand} />
          </ActionPill>
          <ActionPill onPress={onDelete} backgroundColor={colors.dangerBg}>
            <Feather name="trash-2" size={17} color={colors.dangerIcon} />
          </ActionPill>
        </>
      )}
    </View>
  )
}

function ActionPill({
  onPress,
  backgroundColor,
  children,
}: {
  onPress: () => void
  backgroundColor: string
  children: React.ReactNode
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.pill, { backgroundColor }, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
})
