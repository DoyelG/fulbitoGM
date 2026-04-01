'use client'

import { PlayerListRow, SimpleFeatureScreen } from '@fulbito/ui'
import { usePlayerStore } from '@fulbito/state'
import { useFulbitoTabDataReload } from '../../lib/useFulbitoTabDataReload'
import { Image } from 'expo-image'
import { Link, type Href } from 'expo-router'
import { ActivityIndicator, Pressable } from 'react-native'
import { Button, Paragraph, YStack } from 'tamagui'

export default function PlayersScreen() {
  const { players, playersInit, initLoad } = usePlayerStore()
  useFulbitoTabDataReload()

  return (
    <SimpleFeatureScreen
      title="Jugadores"
      subtitle="Misma API y base de datos que la web. En Android emulador, localhost se mapea a 10.0.2.2 automáticamente."
    >
      {playersInit === 'loading' && players.length === 0 ? (
        <YStack alignItems="center" paddingVertical={24} gap={12}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Paragraph color="$color.muted">Cargando jugadores…</Paragraph>
        </YStack>
      ) : playersInit === 'error' ? (
        <YStack gap={12} alignItems="flex-start">
          <Paragraph color="$color.danger">
            No se pudo conectar al API. Revisá EXPO_PUBLIC_API_URL (IP de tu PC en red local si usás
            dispositivo físico).
          </Paragraph>
          <Button backgroundColor="$color.brand" onPress={() => void initLoad({ force: true })}>
            <Paragraph color="$color.white">Reintentar</Paragraph>
          </Button>
        </YStack>
      ) : players.length === 0 ? (
        <Paragraph color="$color.muted">No hay jugadores en la base de datos.</Paragraph>
      ) : (
        <YStack gap={10}>
          {players.map((p) => (
            <Link key={p.id} href={`/players/${p.id}` as Href} asChild>
              <Pressable>
                <PlayerListRow
                  name={p.name}
                  position={p.position}
                  skill={p.skill ?? 'unknown'}
                  leading={
                    <Image
                      source={p.photoUrl ? { uri: p.photoUrl } : require('@/assets/images/icon.png')}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  }
                />
              </Pressable>
            </Link>
          ))}
        </YStack>
      )}
    </SimpleFeatureScreen>
  )
}
