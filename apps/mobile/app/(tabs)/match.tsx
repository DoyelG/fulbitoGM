'use client'

import type { PlayerInfo, TeamResult } from '@fulbito/types'
import { useMatchStore, usePlayerStore } from '@fulbito/state'
import { balanceTeams, buildPlayedBeforeSet, computeLeastAssignedPoolIds, getEligiblePlayerIds } from '@fulbito/utils'
import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView } from 'react-native'
import { Button, Paragraph, Separator, XStack, YStack } from 'tamagui'

type MatchType = '5v5' | '6v6' | '7v7' | '8v8' | '9v9'
const MATCH_TYPES: MatchType[] = ['5v5', '6v6', '7v7', '8v8', '9v9']

export default function MatchScreen() {
  const { players, initLoad } = usePlayerStore()
  const { matches: allMatches, initLoad: initMatches } = useMatchStore()
  const [matchType, setMatchType] = useState<MatchType>('5v5')
  const playersPerTeam = useMemo(() => parseInt(matchType.split('v')[0], 10), [matchType])
  const requiredPlayers = playersPerTeam * 2

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [autoTeams, setAutoTeams] = useState<{ teamA: TeamResult; teamB: TeamResult } | null>(null)
  const [shirtsResponsibleId, setShirtsResponsibleId] = useState<string | null>(null)
  const [dutyPool, setDutyPool] = useState<PlayerInfo[]>([])

  useEffect(() => {
    void initLoad()
    void initMatches()
  }, [initLoad, initMatches])

  const playedBefore = useMemo(() => buildPlayedBeforeSet(allMatches), [allMatches])

  const selectedPlayers: PlayerInfo[] = useMemo(() => {
    const ids = new Set(selected)
    return players
      .filter((p) => ids.has(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        skill: (p.skill ?? 'unknown') as number | 'unknown',
        position: p.position,
        physical: (p.skills?.physical ?? 'unknown') as number | 'unknown',
      }))
  }, [players, selected])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })
  }

  const doAuto = () => {
    if (selected.size !== requiredPlayers) {
      return
    }
    const teams = balanceTeams(selectedPlayers, playersPerTeam)
    setAutoTeams(teams)
    const teamIds = [...teams.teamA.players, ...teams.teamB.players].map((p) => p.id)
    const consideredIds = getEligiblePlayerIds(teamIds, playedBefore)
    const { poolIds } = computeLeastAssignedPoolIds(consideredIds, players)
    const poolObjs = [...teams.teamA.players, ...teams.teamB.players].filter((p) => poolIds.includes(p.id))
    setDutyPool(poolObjs)
    setShirtsResponsibleId(poolIds.length ? poolIds[Math.floor(Math.random() * poolIds.length)] : null)
  }

  const totalSkillA = autoTeams?.teamA.totalSkill ?? 0
  const totalSkillB = autoTeams?.teamB.totalSkill ?? 0
  const combinedSkill = totalSkillA + totalSkillB
  const probA = combinedSkill > 0 ? Math.round((totalSkillA / combinedSkill) * 100) : 50
  const probB = combinedSkill > 0 ? 100 - probA : 50

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <YStack padding={16} gap={16}>
        <Paragraph fontSize={24} fontWeight="700">
          Preparar partido
        </Paragraph>
        <YStack backgroundColor="white" padding={16} borderRadius={12} borderWidth={1} borderColor="#e5e7eb">
          <Paragraph fontWeight="600" marginBottom={8}>
            Tipo de partido
          </Paragraph>
          <XStack flexWrap="wrap" gap={8}>
            {MATCH_TYPES.map((m) => (
              <Button
                key={m}
                size="$3"
                onPress={() => setMatchType(m)}
                backgroundColor={matchType === m ? '#7c3aed' : '#f3f4f6'}
                style={{ color: matchType === m ? '#fff' : '#111' }}
              >
                {m}
              </Button>
            ))}
          </XStack>
          <Paragraph marginTop={12} fontSize={14} color="#374151">
            Seleccionados: {selected.size} / {requiredPlayers}
          </Paragraph>
        </YStack>

        <YStack backgroundColor="white" padding={16} borderRadius={12} borderWidth={1} borderColor="#e5e7eb">
          <Paragraph fontWeight="600" marginBottom={8}>
            Jugadores
          </Paragraph>
          {players.map((p) => (
            <Pressable key={p.id} onPress={() => toggleSelect(p.id)}>
              <XStack alignItems="center" gap={12} marginBottom={8}>
                <Paragraph fontSize={18}>{selected.has(p.id) ? '☑' : '☐'}</Paragraph>
                <Paragraph>{p.name}</Paragraph>
              </XStack>
            </Pressable>
          ))}
          <Button
            marginTop={12}
            backgroundColor="#16a34a"
            onPress={doAuto}
            disabled={selected.size !== requiredPlayers}
            opacity={selected.size !== requiredPlayers ? 0.5 : 1}
            style={{ color: '#fff' }}
          >
            Auto-generar equipos
          </Button>
        </YStack>

        {autoTeams ? (
          <YStack gap={16}>
            <XStack gap={12} flexWrap="wrap" justifyContent="center">
              <TeamBlock title="Equipo A" team={autoTeams.teamA} color="#2563eb" winProbability={probA} />
              <TeamBlock title="Equipo B" team={autoTeams.teamB} color="#dc2626" winProbability={probB} />
            </XStack>
            <Separator />
            <YStack gap={8}>
              <Paragraph fontWeight="600">Encargado de camisetas</Paragraph>
              <Paragraph fontSize={14} color="#374151">
                {shirtsResponsibleId
                  ? players.find((p) => p.id === shirtsResponsibleId)?.name ?? '—'
                  : dutyPool.length
                    ? `${players.find((p) => p.id === dutyPool[0].id)?.name ?? '—'} (pool ${dutyPool.length})`
                    : 'Generá equipos primero'}
              </Paragraph>
            </YStack>
          </YStack>
        ) : null}
      </YStack>
    </ScrollView>
  )
}

function TeamBlock({
  title,
  team,
  color,
  winProbability,
}: {
  title: string
  team: TeamResult
  color: string
  winProbability: number
}) {
  return (
    <YStack
      flex={1}
      minWidth={140}
      borderWidth={1}
      borderColor="#e5e7eb"
      borderRadius={12}
      padding={12}
    >
      <Paragraph fontWeight="700" color={color} textAlign="center" marginBottom={8}>
        {title}
      </Paragraph>
      {team.players.map((p: PlayerInfo) => (
        <Paragraph key={p.id} textAlign="center" marginBottom={6}>
          {p.name}
        </Paragraph>
      ))}
      <Paragraph fontSize={13} textAlign="center" marginTop={8} color="#374151">
        Habilidad {team.totalSkill} · Físico {team.totalPhysical} · Victoria ~{winProbability}%
      </Paragraph>
    </YStack>
  )
}
