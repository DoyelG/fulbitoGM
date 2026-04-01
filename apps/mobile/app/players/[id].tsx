'use client'

import { SkillBadge } from '@fulbito/ui'
import { usePlayerStore } from '@fulbito/state'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { useCallback } from 'react'
import { ScrollView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Paragraph, YStack } from 'tamagui'

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { players, initLoad, getPlayer } = usePlayerStore()

  useFocusEffect(
    useCallback(() => {
      void initLoad({ force: true })
    }, [initLoad]),
  )

  const player = getPlayer(id)

  if (!player) {
    return (
      <YStack flex={1} padding={24} gap={16} backgroundColor="#f9fafb" justifyContent="center">
        <Paragraph fontSize={16} color="#6b7280">
          {players.length === 0 ? 'Cargando jugadores…' : 'Jugador no encontrado.'}
        </Paragraph>
      </YStack>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <YStack padding={20} gap={16}>
        <Image
          source={player.photoUrl ? { uri: player.photoUrl } : require('@/assets/images/icon.png')}
          style={{ width: 120, height: 120, borderRadius: 60, alignSelf: 'center' }}
        />
        <Paragraph fontSize={26} fontWeight="800" textAlign="center">
          {player.name}
        </Paragraph>
        <Paragraph textAlign="center" color="#6b7280">
          {player.position}
        </Paragraph>
        <YStack alignItems="center">
          <SkillBadge skill={player.skill ?? 'unknown'} />
        </YStack>
        <YStack gap={8}>
          <Paragraph fontWeight="600">Habilidades</Paragraph>
          <Paragraph fontSize={14} color="#374151">
            Físico {player.skills?.physical ?? '—'} · Técnico {player.skills?.technical ?? '—'} · Táctico{' '}
            {player.skills?.tactical ?? '—'} · Mental {player.skills?.psychological ?? '—'}
          </Paragraph>
        </YStack>
      </YStack>
    </ScrollView>
  )
}
