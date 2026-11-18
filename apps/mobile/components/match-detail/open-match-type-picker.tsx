import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import type { MatchType } from '@fulbito/types'
import { canResizeOpenMatch, MATCH_TYPES } from '@fulbito/utils'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import type { OpenMatchController } from '@/hooks/use-open-match'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './open-match-type-picker.styles'

type Props = {
  controller: OpenMatchController
}

export function OpenMatchTypePicker({ controller }: Props) {
  const { colors } = useAppTheme()
  const [open, setOpen] = useState(false)
  const { match, pending, changeType } = controller
  if (!match) return null
  const signupCount = match.signups?.length ?? 0

  const pick = (type: MatchType) => {
    setOpen(false)
    if (type !== match.type) void changeType(type)
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={pending}
        accessibilityRole="button"
        accessibilityLabel={`Modo de partido: ${match.type}`}
        accessibilityHint="Cambia la cantidad de lugares del partido"
        accessibilityState={{ disabled: pending }}
        style={[styles.trigger, { borderColor: colors.border }, pending && styles.disabled]}
      >
        <Text style={[styles.triggerText, { color: colors.text }]}>{match.type}</Text>
        <MaterialIcons name="expand-more" size={20} color={colors.muted} />
      </Pressable>

      <BottomSheet visible={open} title="Modo de partido" closeLabel="Cerrar" onConfirm={() => setOpen(false)}>
        {MATCH_TYPES.map((type) => {
          const fits = canResizeOpenMatch(signupCount, type)
          const selected = type === match.type
          return (
            <Pressable
              key={type}
              onPress={() => pick(type)}
              disabled={!fits}
              accessibilityRole="button"
              accessibilityLabel={type}
              accessibilityHint={fits ? undefined : 'Hay demasiados inscriptos para este tamaño'}
              accessibilityState={{ disabled: !fits, selected }}
              style={[styles.option, { borderBottomColor: colors.chipBorder }, !fits && styles.disabled]}
            >
              <View style={styles.optionLabel}>
                <Text style={[styles.optionText, { color: selected ? colors.primaryText : colors.text }]}>{type}</Text>
                {!fits && <Text style={[styles.optionHint, { color: colors.muted }]}>Hay demasiados inscriptos</Text>}
              </View>
              {selected && <MaterialIcons name="check" size={20} color={colors.primaryText} />}
            </Pressable>
          )
        })}
      </BottomSheet>
    </>
  )
}
