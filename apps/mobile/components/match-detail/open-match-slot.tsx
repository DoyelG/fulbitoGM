import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { Pressable, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './open-match-signups.styles'

type Props = {
  position: number
  name: string | null
  isMe: boolean
  onSelect: (() => void) | null
  selectLabel: string
  onRemove: (() => void) | null
  disabled: boolean
}

export function OpenMatchSlot({ position, name, isMe, onSelect, selectLabel, onRemove, disabled }: Props) {
  const { colors } = useAppTheme()
  const number = (
    <Text style={[styles.position, { color: colors.muted }]} accessible={false}>
      {position}
    </Text>
  )

  if (name === null) {
    const content = (
      <>
        {number}
        <Text style={[styles.name, { color: onSelect ? colors.primaryText : colors.muted }]}>
          {onSelect ? `Lugar libre · ${selectLabel}` : 'Lugar libre'}
        </Text>
      </>
    )
    if (!onSelect) {
      return (
        <View
          style={[styles.slot, styles.slotEmpty, { borderColor: colors.chipBorder }]}
          accessible
          accessibilityLabel={`Lugar ${position} libre`}
        >
          {content}
        </View>
      )
    }
    return (
      <Pressable
        onPress={onSelect}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${selectLabel} en el lugar ${position}`}
        accessibilityState={{ disabled }}
        style={[styles.slot, styles.slotEmpty, { borderColor: colors.primaryRing }]}
      >
        {content}
      </Pressable>
    )
  }

  return (
    <View
      style={[styles.slot, { backgroundColor: isMe ? colors.primarySoft : colors.neutralSubtle }]}
      accessible={!onRemove}
      accessibilityLabel={`${position}. ${name}${isMe ? ' (vos)' : ''}`}
    >
      {number}
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {name}
      </Text>
      {isMe && <Text style={[styles.meBadge, { backgroundColor: colors.primary, color: colors.onPrimary }]}>Vos</Text>}
      {onRemove && (
        <Pressable
          onPress={onRemove}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={`Quitar a ${name} de la lista`}
          accessibilityState={{ disabled }}
          style={styles.removeBtn}
        >
          <MaterialIcons name="close" size={20} color={colors.muted} />
        </Pressable>
      )}
    </View>
  )
}
