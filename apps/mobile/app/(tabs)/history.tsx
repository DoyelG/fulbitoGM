'use client'

import { useMatchStore, usePlayerStore } from '@fulbito/state'
import { MatchHistoryCard } from '@fulbito/ui'
import { useEffect, useMemo } from 'react'
import { ScrollView } from 'react-native'
import { Paragraph, YStack } from 'tamagui'

export default function HistoryScreen() {
  const { matches, initLoad } = useMatchStore()
  const { players, initLoad: initPlayers } = usePlayerStore()

  useEffect(() => {
    void initLoad()
    void initPlayers()
  }, [initLoad, initPlayers])

  const nameById = useMemo(() => new Map(players.map((p) => [p.id, p.name])), [players])

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <YStack padding={16} gap={12}>
        <Paragraph fontSize={24} fontWeight="700">
          Historial
        </Paragraph>
        <YStack gap={12}>
          {matches.length === 0 ? (
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
