import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  mode: 'create' | 'edit'
  saving: boolean
  canSave: boolean
  onCancel: () => void
  onSave: () => void
}

export function FormActions({ mode, saving, canSave, onCancel, onSave }: Props) {
  const { colors, radii, spacing } = useAppTheme()

  const saveLabel = saving
    ? mode === 'edit'
      ? 'Actualizando…'
      : 'Guardando…'
    : mode === 'edit'
      ? 'Actualizar partido'
      : 'Guardar partido'

  return (
    <View style={[styles.row, { marginTop: spacing.xl }]}>
      <TouchableOpacity
        onPress={onCancel}
        style={[styles.cancel, { borderColor: colors.border, borderRadius: radii.sm }]}
      >
        <Text style={[styles.cancelText, { color: colors.text }]}>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        disabled={!canSave || saving}
        style={[
          styles.save,
          {
            backgroundColor: canSave && !saving ? colors.brand : colors.muted,
            borderRadius: radii.sm,
          },
        ]}
      >
        <Text style={styles.saveText}>{saveLabel}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cancel: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  save: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
})
