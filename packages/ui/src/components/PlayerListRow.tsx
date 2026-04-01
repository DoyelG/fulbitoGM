import type { ReactNode } from 'react'
import { Paragraph, XStack, YStack } from 'tamagui'
import { FulbitoCard } from './FulbitoCard'
import { SkillBadge } from './SkillBadge'

export type PlayerListRowProps = {
  name: string
  position: string
  skill: number | 'unknown'
  leading: ReactNode
}

export function PlayerListRow({ name, position, skill, leading }: PlayerListRowProps) {
  return (
    <FulbitoCard padding={12} gap={0}>
      <XStack alignItems="center" gap={12}>
        {leading}
        <YStack flex={1} minWidth={0}>
          <Paragraph fontWeight="700" color="$color.black" numberOfLines={2}>
            {name}
          </Paragraph>
          <Paragraph fontSize={13} color="$color.muted" numberOfLines={2}>
            {position}
          </Paragraph>
        </YStack>
        <SkillBadge skill={skill} />
      </XStack>
    </FulbitoCard>
  )
}
