'use client'

import { useMatchStore, usePlayerStore } from '@fulbito/state'
import { MatchHistoryCard } from '@fulbito/ui'
import { useFulbitoTabDataReload } from '../../lib/useFulbitoTabDataReload'
import { useMemo } from 'react'
import { ScrollView } from 'react-native'
import { Paragraph, YStack } from 'tamagui'

export default function HistoryScreen() {
  const { matches, matchesInit } = useMatchStore()
  const { players, playersInit } = usePlayerStore()
  useFulbitoTabDataReload()

  const nameById = useMemo(() => new Map(players.map((p) => [p.id, p.name])), [players])

  const loading =
    (matchesInit === 'loading' && matches.length === 0) ||
    (playersInit === 'loading' && players.length === 0)
  const failed = matchesInit === 'error' || playersInit === 'error'

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <YStack padding={16} gap={12}>
        <Paragraph fontSize={24} fontWeight="700">
          Historial
        </Paragraph>
        <YStack gap={12}>
          {loading ? (
            <Paragraph color="$color.muted">Cargando historial…</Paragraph>
          ) : failed ? (
            <Paragraph color="$color.danger">No se pudo cargar el historial. Revisá la conexión al API.</Paragraph>
          ) : matches.length === 0 ? (
            <Paragraph color="#6b7280">No hay partidos.</Paragraph>
          ) : (
            matches.map((m) => (
              <MatchHistoryCard
                key={m.id}
                match={m}
                shirtResponsibleName={
                  m.shirtsResponsibleId ? nameById.get(m.shirtsResponsibleId) ?? null : null
                }
              />
            ))
          )}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
