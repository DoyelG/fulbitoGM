'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Paragraph, useMedia, XStack, YStack } from 'tamagui'
import AppBootstrap from './shared/AppBootstrap'
import AuthProvider from './shared/AuthProvider'
import NavAuth from './shared/NavAuth'
import TamaguiRoot from './TamaguiRoot'

const navLinkProps = {
  paddingHorizontal: 8,
  paddingVertical: 6,
  borderRadius: 8,
  color: 'white' as const,
  fontSize: 12,
  fontWeight: '500' as const,
  hoverStyle: { backgroundColor: 'rgba(255,255,255,0.2)' },
  pressStyle: { opacity: 0.92 },
  $gtSm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
}

function NavLinks() {
  return (
    <>
      <Link href="/statistics" style={{ textDecoration: 'none' }}>
        <Paragraph {...navLinkProps}>Estadísticas</Paragraph>
      </Link>
      <Link href="/players" style={{ textDecoration: 'none' }}>
        <Paragraph {...navLinkProps}>Jugadores</Paragraph>
      </Link>
      <Link href="/match" style={{ textDecoration: 'none' }}>
        <Paragraph {...navLinkProps}>Nuevo partido</Paragraph>
      </Link>
      <Link href="/history" style={{ textDecoration: 'none' }}>
        <Paragraph {...navLinkProps}>Historial</Paragraph>
      </Link>
    </>
  )
}

function AppHeaderBar() {
  const media = useMedia()
  const isDesktop = media.gtMd

  const shellProps = {
    width: '100%' as const,
    alignSelf: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 4,
    $gtSm: { paddingHorizontal: 24 },
    $gtLg: { paddingHorizontal: 40 },
    style: { maxWidth: 'min(100vw - 2rem, 1920px)' },
  }

  if (isDesktop) {
    return (
      <XStack
        {...shellProps}
        alignItems="center"
        justifyContent="space-between"
        gap={16}
        flexWrap="nowrap"
        minWidth={0}
      >
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Paragraph color="white" fontSize={24} fontWeight="800">
            FulbitoApp
          </Paragraph>
        </Link>
        <XStack flex={1} minWidth={0} alignItems="center" justifyContent="flex-end" flexWrap="wrap" gap={8} rowGap={10}>
          <NavLinks />
          <YStack width={1} height={24} backgroundColor="rgba(255,255,255,0.35)" flexShrink={0} aria-hidden />
          <NavAuth />
        </XStack>
      </XStack>
    )
  }

  return (
    <YStack {...shellProps} gap={12}>
      <XStack width="100%" justifyContent="space-between" alignItems="center" gap={12} minWidth={0}>
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0, minWidth: 0 }}>
          <Paragraph color="white" fontSize={20} fontWeight="800" numberOfLines={1}>
            FulbitoApp
          </Paragraph>
        </Link>
        <NavAuth />
      </XStack>
      <XStack
        width="100%"
        minWidth={0}
        flexWrap="wrap"
        alignItems="center"
        justifyContent="flex-start"
        gap={8}
        rowGap={10}
      >
        <NavLinks />
      </XStack>
    </YStack>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <TamaguiRoot>
      <AuthProvider>
        <YStack flex={1} minHeight="100vh" backgroundColor="$background">
          <YStack
            backgroundColor="$color.brand"
            paddingVertical={16}
            shadowColor="rgba(0,0,0,0.12)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={1}
            shadowRadius={8}
          >
            <AppHeaderBar />
          </YStack>
          <YStack flex={1}>{children}</YStack>
          <AppBootstrap />
        </YStack>
      </AuthProvider>
    </TamaguiRoot>
  )
}
