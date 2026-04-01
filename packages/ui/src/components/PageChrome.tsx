import type { ReactElement, ReactNode } from 'react'
import { Platform, type RefreshControlProps, type TextStyle } from 'react-native'
import { Paragraph, ScrollView, Text, YStack } from 'tamagui'

type Props = {
  children: ReactNode
  refreshControl?: ReactElement<RefreshControlProps>
}

export function PageChrome({ children, refreshControl }: Props) {
  return (
    <YStack flex={1} backgroundColor="$background" minHeight={Platform.OS === 'web' ? '100vh' : undefined}>
      <ScrollView
        flex={Platform.OS === 'web' ? undefined : 1}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        <YStack
          width="100%"
          alignSelf="center"
          paddingHorizontal={16}
          paddingTop={32}
          paddingBottom={24}
          gap={24}
          $gtSm={{ paddingHorizontal: 24 }}
          $gtMd={{ paddingHorizontal: 32, paddingTop: 36, paddingBottom: 32 }}
          $gtLg={{ paddingHorizontal: 48, paddingTop: 40, paddingBottom: 40, gap: 28 }}
          style={Platform.OS === 'web' ? { maxWidth: 'min(100vw - 2rem, 1920px)' } : undefined}
        >
          {children}
        </YStack>
      </ScrollView>
    </YStack>
  )
}

export function HeroTitle({ children }: { children: ReactNode }) {
  const isWeb = Platform.OS === 'web'
  return (
    <YStack alignItems="center" gap={12} marginBottom={16}>
      <Text
        style={
          isWeb
            ? ({
                fontSize: 56,
                lineHeight: 58,
                fontWeight: '800',
                letterSpacing: -1,
                textAlign: 'center',
                backgroundImage: 'linear-gradient(90deg, #6366f1, #d946ef, #f43f5e)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              } as TextStyle)
            : ({
                fontSize: 48,
                lineHeight: 52,
                fontWeight: '800',
                letterSpacing: -1,
                textAlign: 'center',
                color: '#7c3aed',
              } as TextStyle)
        }
      >
        {children}
      </Text>
    </YStack>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Paragraph fontSize={24} fontWeight="700" color="$color.black">
      {children}
    </Paragraph>
  )
}
