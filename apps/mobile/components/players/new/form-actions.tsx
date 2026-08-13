import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Fonts, Spacing } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  canSave: boolean
  saving: boolean
  onSave: () => void
  onCancel: () => void
}

export function FormActions({ canSave, saving, onSave, onCancel }: Props) {
  const { colors, radii, shadows } = useAppTheme()
  return (
    <>
      <Pressable
        onPress={onSave}
        disabled={!canSave}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave, busy: saving }}
        style={[
          styles.saveBtn,
          { backgroundColor: canSave ? colors.secondary : colors.muted, borderRadius: radii.md, opacity: canSave ? 1 : 0.5},
          canSave && shadows.cta(colors.secondary),
        ]}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.saveText}>Guardar Jugador</ThemedText>
        )}
      </Pressable>

      <TouchableOpacity
        onPress={onCancel}
        style={styles.cancelBtn}
        accessibilityRole="button"
        accessibilityLabel="Cancelar">
        <ThemedText style={[styles.cancelText, { color:colors.danger }]}>Cancelar</ThemedText>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  saveBtn: {
    marginTop: Spacing.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.extraBoldItalic,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
