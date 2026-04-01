import type { ReactNode } from 'react'
import { Paragraph, XStack, YStack } from 'tamagui'
import { FulbitoCard } from './FulbitoCard'

export type HomeFeatureCardProps = {
  title: string
  description: string
  iconSlot: ReactNode
}

export function HomeFeatureCard({ title, description, iconSlot }: HomeFeatureCardProps) {
  return (
    <FulbitoCard backgroundColor="rgba(255,255,255,0.92)">
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
    </FulbitoCard>
  )
}
