'use client'

import { SkillBadge } from '@fulbito/ui'
import { usePlayerStore } from '@fulbito/state'
import { Image } from 'expo-image'
import { Link, type Href } from 'expo-router'
import { useEffect } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { Paragraph, XStack, YStack } from 'tamagui'

export default function PlayersScreen() {
  const { players, initLoad } = usePlayerStore()

  useEffect(() => {
    void initLoad()
  }, [initLoad])

  return (
    <YStack flex={1} backgroundColor="#f9fafb" padding={16}>
      <Paragraph fontSize={24} fontWeight="700" marginBottom={16}>
        Jugadores
      </Paragraph>
      <ScrollView>
        <YStack gap={10}>
          {players.length === 0 ? (
            <Paragraph color="#6b7280">No hay jugadores. Sincronizá con el servidor (API).</Paragraph>
          ) : (
            players.map((p) => (
              <Link key={p.id} href={`/players/${p.id}` as Href} asChild>
                <Pressable>
                  <XStack
                    alignItems="center"
                    gap={12}
                    padding={12}
                    borderRadius={12}
                    borderWidth={1}
                    borderColor="#e5e7eb"
                    backgroundColor="white"
                  >
                    <Image
                      source={p.photoUrl ? { uri: p.photoUrl } : require('@/assets/images/icon.png')}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                    <YStack flex={1}>
                      <Paragraph fontWeight="700" color="#111827">
                        {p.name}
                      </Paragraph>
                      <Paragraph fontSize={13} color="#6b7280">
                        {p.position}
                      </Paragraph>
                    </YStack>
                    <SkillBadge skill={p.skill ?? 'unknown'} />
                  </XStack>
                </Pressable>
              </Link>
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
}
