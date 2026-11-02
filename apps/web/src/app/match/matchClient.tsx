'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { usePlayerStore, Player } from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'
import {
  balanceRemainingPlayers,
  balanceTeams,
  seedPriorityPlayers,
  getHotStreakIds,
  type PlayerInfo,
  type TeamResult,
} from '@/lib/teamUtils'
import { calculateAllCurrentStreaks, getGoalkeeping } from '@/lib/playerStats'
import { onlyFinalMatches } from '@fulbito/utils'
import Button from '@/components/Button'
import PageTitle from '@/components/PageTitle'
import type { MatchType } from '@fulbito/types'
import { Stepper } from './stepper'
import { usePlayerSelection } from './use-player-selection'
import PlayersStep from './playersStep'
import TeamsStep from './teamsStep'
import DataStep, { type DraftForm } from './dataStep'

export type Step = 1 | 2 | 3

export default function MatchClient({ players: initialPlayers }: { players: Player[] }) {
  const { players, hydratePlayers, resetAndReload } = usePlayerStore()
  const { initLoad: initMatchesLoad, resetAndReload: resetMatches } = useMatchStore()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [stepHistory, setStepHistory] = useState<Step[]>([])
  const [matchType, setMatchType] = useState<MatchType | null>(null)
  const [isFriendly, setIsFriendly] = useState(false)
  const [draft, setDraft] = useState<DraftForm>(() => ({
    date: new Date().toISOString().slice(0, 10),
    hour: null,
    name: '',
    location: null,
    description: '',
  }))

  const playersPerTeam = useMemo(() => {
    if (!matchType) return 0
    return parseInt(matchType.split('v')[0], 10)
  }, [matchType])
  const requiredPlayers = playersPerTeam * 2

  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    hydratePlayers(initialPlayers)
    resetAndReload()
    resetMatches()
  }, [hydratePlayers, initialPlayers, resetAndReload, resetMatches])

  const [autoTeams, setAutoTeams] = useState<{ teamA: TeamResult; teamB: TeamResult } | null>(null)
  const [streakSeparated, setStreakSeparated] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [manualA, setManualA] = useState<PlayerInfo[]>([])
  const [manualB, setManualB] = useState<PlayerInfo[]>([])

  const selection = usePlayerSelection({
    onDeselect: (playerId) => {
      setManualA((prev) => prev.filter((player) => player.id !== playerId))
      setManualB((prev) => prev.filter((player) => player.id !== playerId))
    },
  })
  const { selected, goalkeeperIds } = selection

  const selectedPlayers: PlayerInfo[] = useMemo(() => {
    const ids = new Set(selected)
    return players
      .filter((player) => ids.has(player.id))
      .map((player) => ({
        id: player.id,
        name: player.name,
        skill: goalkeeperIds.has(player.id)
          ? getGoalkeeping(player)
          : ((player.skill ?? 'unknown') as number | 'unknown'),
        position: player.position,
        physical: (player.skills?.physical ?? 'unknown') as number | 'unknown',
      }))
  }, [players, selected, goalkeeperIds])

  const manualIds = useMemo(() => new Set([...manualA, ...manualB].map((player) => player.id)), [manualA, manualB])

  const unassignedManual = useMemo(
    () => selectedPlayers.filter((player) => !manualIds.has(player.id)),
    [selectedPlayers, manualIds],
  )

  const buildTeams = (
    pool: PlayerInfo[],
    streaks: Record<string, { kind: 'win' | 'loss' | null; count: number }>,
    pinnedSeedA: PlayerInfo[] = [],
    pinnedSeedB: PlayerInfo[] = [],
  ) => {
    const { seedA, seedB, rest, hadStreakSeed } = seedPriorityPlayers(pool, playersPerTeam, {
      goalkeeperIds,
      streaks,
      initialSeedA: pinnedSeedA,
      initialSeedB: pinnedSeedB,
    })
    if (seedA.length === 0 && seedB.length === 0) {
      return { teams: balanceTeams(pool, playersPerTeam), hadStreak: false }
    }
    const hardLockedIds = new Set([...pinnedSeedA, ...pinnedSeedB].map((player) => player.id))
    const hotStreakIds = getHotStreakIds(pool, streaks)
    return {
      teams: balanceRemainingPlayers(rest, seedA, seedB, playersPerTeam, {
        hardLockedIds,
        goalkeeperIds,
        hotStreakIds,
      }),
      hadStreak: hadStreakSeed,
    }
  }

  const isSelectionComplete = matchType !== null && selected.size === requiredPlayers

  const generateTeams = async (): Promise<boolean> => {
    if (!isSelectionComplete) return false
    await initMatchesLoad()
    const currentFinalMatches = onlyFinalMatches(useMatchStore.getState().matches)
    const streaks = calculateAllCurrentStreaks(currentFinalMatches)
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5)
    const { teams, hadStreak } = buildTeams(shuffled, streaks, manualA, manualB)
    setAutoTeams(teams)
    setStreakSeparated(hadStreak)
    setGeneration((count) => count + 1)
    return true
  }

  const goToStep = (step: Step) => {
    setStepHistory((prev) => [...prev, currentStep])
    setCurrentStep(step)
  }

  const goBack = () => {
    const previousStep = stepHistory[stepHistory.length - 1]
    if (previousStep === undefined) return
    setStepHistory((prev) => prev.slice(0, -1))
    setCurrentStep(previousStep)
  }

  const returnToStep = (step: Step) => {
    if (step >= currentStep) return
    setStepHistory((prev) => prev.filter((previousStep) => previousStep < step))
    setCurrentStep(step)
  }

  const generateAndContinue = async () => {
    if (await generateTeams()) goToStep(3)
  }

  const changeMatchType = (type: MatchType | null) => {
    setMatchType(type)
    setManualA([])
    setManualB([])
  }

  const moveManual = (player: PlayerInfo, target: 'unassigned' | 'a' | 'b') => {
    setManualA((prev) => prev.filter((assignedPlayer) => assignedPlayer.id !== player.id))
    setManualB((prev) => prev.filter((assignedPlayer) => assignedPlayer.id !== player.id))
    if (target === 'a') {
      setManualA((prev) => (prev.length >= playersPerTeam ? prev : [...prev, player]))
    } else if (target === 'b') {
      setManualB((prev) => (prev.length >= playersPerTeam ? prev : [...prev, player]))
    }
  }

  const renderStep = (): ReactNode => {
    switch (currentStep) {
      case 1:
        return (
          <PlayersStep
            players={players}
            matchType={matchType}
            onMatchTypeChange={changeMatchType}
            requiredPlayers={requiredPlayers}
            isFriendly={isFriendly}
            selection={selection}
            isSelectionComplete={isSelectionComplete}
            onManual={() => goToStep(2)}
            onAuto={generateAndContinue}
          />
        )
      case 2:
        return (
          <TeamsStep
            unassigned={unassignedManual}
            teamA={manualA}
            teamB={manualB}
            playersPerTeam={playersPerTeam}
            goalkeeperIds={goalkeeperIds}
            onMove={moveManual}
            onReset={() => {
              setManualA([])
              setManualB([])
            }}
            onContinue={generateAndContinue}
          />
        )
      case 3:
        if (!autoTeams || !matchType) return null
        return (
          <DataStep
            key={generation}
            teamA={autoTeams.teamA}
            teamB={autoTeams.teamB}
            matchType={matchType}
            players={players}
            goalkeeperIds={goalkeeperIds}
            manualIds={manualIds}
            streakSeparated={streakSeparated}
            isFriendly={isFriendly}
            onFriendlyToggle={() => setIsFriendly((wasFriendly) => !wasFriendly)}
            draft={draft}
            onDraftChange={(changes) => setDraft((prev) => ({ ...prev, ...changes }))}
            onRegenerate={generateTeams}
          />
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <PageTitle
        spacing={0}
        actions={
          stepHistory.length > 0 && (
            <Button variant="secondary" onClick={goBack}>
              Volver
            </Button>
          )
        }
      >
        Preparar partido
      </PageTitle>

      <div className="sticky top-0 z-10 bg-gray-50 pt-4">
        <Stepper
          currentStep={matchType ? currentStep : 0}
          className="sticky z-10"
          requiredPlayers={requiredPlayers}
          selectedCount={selected.size}
          unassignedManual={unassignedManual.length}
          onStepClick={returnToStep}
        />
      </div>

      {renderStep()}
    </div>
  )
}
