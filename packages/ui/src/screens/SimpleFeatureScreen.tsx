import type { ReactElement, ReactNode } from 'react'
import type { RefreshControlProps } from 'react-native'
import { Paragraph, YStack } from 'tamagui'
import { PageChrome } from '../components/PageChrome'

export function SimpleFeatureScreen({
  title,
  subtitle,
  children,
  refreshControl,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  refreshControl?: ReactElement<RefreshControlProps>
}) {
  return (
    <PageChrome refreshControl={refreshControl}>
      <YStack gap={16}>
        <YStack gap={6}>
          <Paragraph fontSize={24} fontWeight="700" color="$color.black">
            {title}
          </Paragraph>
          {subtitle ? (
            <Paragraph fontSize={15} lineHeight={22} color="$color.muted">
              {subtitle}
            </Paragraph>
          ) : null}
        </YStack>
        {children}
      </YStack>
    </PageChrome>
  )
}
