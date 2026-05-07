import type { ReactNode } from 'react'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { sheetStyles } from './sharedStyles'

type Props = {
  visible: boolean
  title: string
  closeLabel?: string
  /** Llamado al tocar el botón Listo del header */
  onConfirm: () => void
  /** Llamado al tocar el backdrop. Si no se provee, usa onConfirm */
  onDismiss?: () => void
  children: ReactNode
}

export function BottomSheet({
  visible,
  title,
  closeLabel = 'Listo',
  onConfirm,
  onDismiss,
  children,
}: Props) {
  const { colors } = useAppTheme()

  if (!visible) return null

  return (
    <Modal transparent animationType="fade" visible>
      <Pressable style={sheetStyles.backdrop} onPress={onDismiss ?? onConfirm} />
      <View style={[sheetStyles.container, { backgroundColor: colors.surface }]}>
        <View style={sheetStyles.header}>
          <Text style={[sheetStyles.title, { color: colors.text }]}>{title}</Text>
          <TouchableOpacity onPress={onConfirm}>
            <Text style={[sheetStyles.close, { color: colors.brand }]}>{closeLabel}</Text>
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </Modal>
  )
}
