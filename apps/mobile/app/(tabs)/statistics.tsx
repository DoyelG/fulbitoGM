'use client'

import { useMatchStore, usePlayerStore } from '@fulbito/state'
import { SimpleFeatureScreen } from '@fulbito/ui'
import { useFulbitoTabDataReload } from '../../lib/useFulbitoTabDataReload'
import { Link, type Href } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Pressable } from 'react-native'
import { Paragraph, XStack, YStack } from 'tamagui'

type StatRow = {
  id: string
  name: string
  matches: number
  goals: number
  totalPerformance: number
  wins: number
  losses: number
  draws: number
  shirts: number
}

export default function StatisticsScreen() {
  const { matches, matchesInit } = useMatchStore()
  const { players, playersInit } = usePlayerStore()
  useFulbitoTabDataReload()
  const [sortKey, setSortKey] = useState<keyof StatRow | 'goalsPerMatch' | 'winRate'>('goals')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const stats = useMemo<StatRow[]>(() => {
    const map: Record<string, StatRow> = {}
    const shirtCountById = new Map(players.map((p) => [p.id, p.shirtDutiesCount ?? 0]))
    for (const m of matches) {
      const process = (team: 'A' | 'B') => (p: { id: string; name: string; goals: number; performance: number }) => {
        if (!map[p.id]) {
          map[p.id] = {
            id: p.id,
            name: p.name,
            matches: 0,
            goals: 0,
            totalPerformance: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            shirts: shirtCountById.get(p.id) ?? 0,
          }
        }
        map[p.id].matches++
        map[p.id].goals += p.goals
        map[p.id].totalPerformance += p.performance
        const a = m.teamAScore
        const b = m.teamBScore
        if (team === 'A') {
          if (a > b) map[p.id].wins++
          else if (a < b) map[p.id].losses++
          else map[p.id].draws++
        } else {
          if (b > a) map[p.id].wins++
          else if (b < a) map[p.id].losses++
          else map[p.id].draws++
        }
      }
      m.teamA.forEach(process('A'))
      m.teamB.forEach(process('B'))
    }
    Object.values(map).forEach((stat) => {
      stat.totalPerformance = stat.totalPerformance / stat.matches
    })
    return Object.values(map)
  }, [matches, players])

  const toggleSort = useCallback(
    (key: keyof StatRow | 'goalsPerMatch' | 'winRate') => {
      if (sortKey === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortKey(key)
        setSortDir('desc')
      }
    },
    [sortKey],
  )

  const sorted = useMemo(() => {
    const getValue = (row: StatRow, key: typeof sortKey) => {
      if (key === 'goalsPerMatch') return row.matches === 0 ? 0 : row.goals / row.matches
      if (key === 'winRate') return row.matches === 0 ? 0 : row.wins / row.matches
      return row[key]
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...stats].sort((a, b) => {
      const av = getValue(a, sortKey)
      const bv = getValue(b, sortKey)
      if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir
      const an = Number(av)
      const bn = Number(bv)
      if (Number.isNaN(an) || Number.isNaN(bn)) return 0
      if (an === bn) return 0
      return an > bn ? dir : -dir
    })
  }, [stats, sortKey, sortDir])

  const loading =
    (matchesInit === 'loading' && matches.length === 0) ||
    (playersInit === 'loading' && players.length === 0)
  const failed = matchesInit === 'error' || playersInit === 'error'

  return (
    <SimpleFeatureScreen title="Estadísticas" subtitle="Toca un encabezado para ordenar. Misma lógica que la web.">
      <XStack gap={8} flexWrap="wrap" marginBottom={12}>
        <SortChip label="Goles" active={sortKey === 'goals'} dir={sortDir} onPress={() => toggleSort('goals')} />
        <SortChip label="Nombre" active={sortKey === 'name'} dir={sortDir} onPress={() => toggleSort('name')} />
        <SortChip label="Partidos" active={sortKey === 'matches'} dir={sortDir} onPress={() => toggleSort('matches')} />
      </XStack>
      <YStack gap={12}>
        {loading ? (
          <Paragraph color="$color.muted">Cargando estadísticas…</Paragraph>
        ) : failed ? (
          <Paragraph color="$color.danger">No se pudieron cargar los datos. Revisá EXPO_PUBLIC_API_URL.</Paragraph>
        ) : matches.length === 0 ? (
          <Paragraph color="#6b7280">No hay estadísticas disponibles.</Paragraph>
        ) : (
          sorted.map((stat) => (
            <YStack
              key={stat.id}
              borderWidth={1}
              borderColor="#e5e7eb"
              borderRadius={12}
              padding={14}
              backgroundColor="white"
            >
              <Link href={`/players/${stat.id}` as Href} asChild>
                <Pressable>
                  <Paragraph fontSize={17} fontWeight="700" color="#4f46e5">
                    {stat.name}
                  </Paragraph>
                </Pressable>
              </Link>
              <Paragraph marginTop={8} fontSize={14} color="#374151">
                Partidos {stat.matches} · Goles {stat.goals} · Goles/PJ{' '}
                {stat.matches ? (stat.goals / stat.matches).toFixed(2) : '0'} · Rend.{' '}
                {stat.totalPerformance.toFixed(2)} · {stat.wins}W-{stat.losses}L-{stat.draws}D · Camisetas{' '}
                {stat.shirts}
              </Paragraph>
            </YStack>
          ))
        )}
      </YStack>
    </SimpleFeatureScreen>
  )
}

function SortChip({
  label,
  active,
  dir,
  onPress,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc'
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress}>
      <YStack
        paddingHorizontal={12}
        paddingVertical={8}
        borderRadius={8}
        borderWidth={1}
        borderColor={active ? '#7c3aed' : '#e5e7eb'}
        backgroundColor={active ? 'rgba(124,58,237,0.08)' : 'white'}
      >
        <Paragraph fontSize={13} fontWeight="600" color="#374151">
          {label}
          {active ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}
        </Paragraph>
      </YStack>
    </Pressable>
  )
}
