import type { GetProps } from '@tamagui/core'
import { YStack } from 'tamagui'

export type FulbitoCardProps = GetProps<typeof YStack>

/** Superficie de tarjeta compartida (web + native). */
export function FulbitoCard({ children, ...props }: FulbitoCardProps) {
  return (
    <YStack
      borderWidth={1}
      borderColor="$color.border"
      backgroundColor="rgba(255,255,255,0.96)"
      borderRadius={12}
      padding={16}
      shadowColor="rgba(0,0,0,0.25)"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.08}
      shadowRadius={8}
      elevation={2}
      {...props}
    >
      {children}
    </YStack>
  )
}
