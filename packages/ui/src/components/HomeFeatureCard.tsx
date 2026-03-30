import type { ReactNode } from 'react'
import { Paragraph, XStack, YStack } from 'tamagui'

export type HomeFeatureCardProps = {
  title: string
  description: string
  iconSlot: ReactNode
}

export function HomeFeatureCard({ title, description, iconSlot }: HomeFeatureCardProps) {
  return (
    <YStack
      borderWidth={1}
      borderColor="$color.border"
      backgroundColor="rgba(255,255,255,0.92)"
      borderRadius={12}
      padding={16}
      shadowColor="rgba(0,0,0,0.25)"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.08}
      shadowRadius={8}
      elevation={2}
    >
      <XStack gap={12} alignItems="flex-start">
        <YStack
          padding={8}
          borderRadius={8}
          backgroundColor="$color.card"
          borderWidth={1}
          borderColor="$color.border"
        >
          {iconSlot}
        </YStack>
        <YStack flex={1} gap={8}>
          <Paragraph fontSize={18} fontWeight="700" color="$color.black">
            {title}
          </Paragraph>
          <Paragraph fontSize={14} lineHeight={20} color="$color.textSecondary">
            {description}
          </Paragraph>
        </YStack>
      </XStack>
    </YStack>
  )
}
