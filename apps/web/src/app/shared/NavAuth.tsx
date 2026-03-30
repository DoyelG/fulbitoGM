'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button, Paragraph, XStack, YStack } from 'tamagui'

export default function NavAuth() {
  const { data } = useSession()
  const role = (data?.user as unknown as { role?: string })?.role
  return (
    <XStack alignItems="center" gap={8} flexWrap="wrap" rowGap={8} flexShrink={0}>
      {data?.user ? (
        <>
          <XStack alignItems="center" gap={6} opacity={0.9} userSelect="none" maxWidth="100%">
            <YStack
              width={6}
              height={6}
              borderRadius={999}
              backgroundColor={role === 'ADMIN' ? '#fde047' : 'rgba(255,255,255,0.5)'}
            />
            <Paragraph
              color="white"
              fontSize={10}
              textTransform="uppercase"
              letterSpacing={0.5}
              $gtSm={{ fontSize: 11, letterSpacing: 1 }}
            >
              {role === 'ADMIN' ? 'Admin' : 'Usuario'}
            </Paragraph>
          </XStack>
          <Button
            unstyled
            paddingHorizontal={10}
            paddingVertical={7}
            borderRadius={8}
            backgroundColor="rgba(255,255,255,0.12)"
            hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            onPress={() => signOut({ callbackUrl: '/' })}
            $gtSm={{ paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Paragraph color="white" fontSize={13} fontWeight="600" $gtSm={{ fontSize: 14 }}>
              Salir
            </Paragraph>
          </Button>
        </>
      ) : (
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <Paragraph
            paddingHorizontal={10}
            paddingVertical={7}
            borderRadius={8}
            borderWidth={1}
            borderColor="rgba(255,255,255,0.45)"
            backgroundColor="rgba(255,255,255,0.18)"
            color="white"
            fontSize={13}
            fontWeight="600"
            hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.28)' }}
            $gtSm={{ paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 }}
          >
            Entrar
          </Paragraph>
        </Link>
      )}
    </XStack>
  )
}
