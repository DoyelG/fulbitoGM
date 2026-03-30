import type { ReactNode } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { Modal, Pressable } from 'react-native'
import { Button, Paragraph, XStack, YStack } from 'tamagui'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  destructive,
}: Props) {
  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={() => onOpenChange(false)}>
      <Pressable style={{ flex: 1 }} onPress={() => onOpenChange(false)}>
        <YStack flex={1} backgroundColor="rgba(0,0,0,0.45)" justifyContent="center" alignItems="center" padding={16}>
          <Pressable onPress={(e: GestureResponderEvent) => e.stopPropagation()}>
            <YStack
              backgroundColor="$color.card"
              padding={20}
              borderRadius={12}
              maxWidth={440}
              width="100%"
              gap={16}
              elevation={4}
              borderWidth={1}
              borderColor="$color.border"
              shadowColor="rgba(0,0,0,0.2)"
              shadowRadius={24}
              shadowOffset={{ width: 0, height: 8 }}
              shadowOpacity={0.15}
            >
              <Paragraph fontSize={20} fontWeight="700" color="$color.black">
                {title}
              </Paragraph>
              <Paragraph color="$color.muted">{message}</Paragraph>
              <XStack gap={12} justifyContent="flex-end" flexWrap="wrap">
                <Button variant="outlined" borderColor="$color.border" onPress={() => onOpenChange(false)}>
                  <Paragraph color="$color.black">{cancelLabel}</Paragraph>
                </Button>
                <Button
                  backgroundColor={destructive ? '$color.danger' : '$color.brand'}
                  onPress={() => {
                    onConfirm()
                    onOpenChange(false)
                  }}
                >
                  <Paragraph color="$color.white">{confirmLabel}</Paragraph>
                </Button>
              </XStack>
            </YStack>
          </Pressable>
        </YStack>
      </Pressable>
    </Modal>
  )
}
