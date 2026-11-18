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
import {
  MATCH_TYPES,
  onlyFinalMatches,
  parseMatchDate,
  playersPerTeam as parsePlayersPerTeam,
  splitSignups,
  type Convocatoria,
} from '@fulbito/utils'
import Button from '@/components/Button'
import PageTitle from '@/components/PageTitle'
import { isOpen, type MatchType } from '@fulbito/types'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { Stepper } from './stepper'
import { usePlayerSelection } from './use-player-selection'
import PlayersStep from './playersStep'
import TeamsStep from './teamsStep'
import DataStep from './dataStep'
import OpenMatchForm from './openMatchForm'
import type { DraftForm } from './matchDetailsFields'

export type Step = 1 | 2 | 3

type Props = {
  players: Player[]
  openMatchId: string | null
}

export default function MatchClient({ players: initialPlayers, openMatchId }: Props) {
  const { players, hydratePlayers, resetAndReload } = usePlayerStore()
  const { matches, initLoad: initMatchesLoad, resetAndReload: resetMatches } = useMatchStore()
  const canManage = useCanManageTournament()
  const [convocatoria, setConvocatoria] = useState<Convocatoria>('preselected')
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

  const playersPerTeam = useMemo(() => (matchType ? parsePlayersPerTeam(matchType) : 0), [matchType])
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
      setManualA((previousManualA) => previousManualA.filter((player) => player.id !== playerId))
      setManualB((previousManualB) => previousManualB.filter((player) => player.id !== playerId))
    },
  })
  const { selected, goalkeeperIds } = selection

  const openMatch = useMemo(() => {
    if (!openMatchId) return null
    const found = matches.find((match) => match.id === openMatchId)
    return found && isOpen(found) ? found : null
  }, [matches, openMatchId])

  const prefilledFrom = useRef<string | null>(null)
  const { replace: replaceSelection } = selection

  useEffect(() => {
    if (!openMatch || prefilledFrom.current === openMatch.id) return
    prefilledFrom.current = openMatch.id
    const { date, hour } = parseMatchDate(openMatch)
    setMatchType(MATCH_TYPES.find((type) => type === openMatch.type) ?? null)
    setIsFriendly(openMatch.isFriendly ?? false)
    setDraft({
      date,
      hour,
      name: openMatch.name ?? '',
      location: openMatch.location ?? null,
      description: openMatch.description ?? '',
    })
    replaceSelection(splitSignups(openMatch).confirmed)
  }, [openMatch, replaceSelection])

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
    setStepHistory((previousHistory) => [...previousHistory, currentStep])
    setCurrentStep(step)
  }

  const goBack = () => {
    const previousStep = stepHistory[stepHistory.length - 1]
    if (previousStep === undefined) return
    setStepHistory((previousHistory) => previousHistory.slice(0, -1))
    setCurrentStep(previousStep)
  }

  const returnToStep = (step: Step) => {
    if (step >= currentStep) return
    setStepHistory((previousHistory) => previousHistory.filter((previousStep) => previousStep < step))
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
    setManualA((previousManualA) => previousManualA.filter((assignedPlayer) => assignedPlayer.id !== player.id))
    setManualB((previousManualB) => previousManualB.filter((assignedPlayer) => assignedPlayer.id !== player.id))
    if (target === 'a') {
      setManualA((previousManualA) =>
        previousManualA.length >= playersPerTeam ? previousManualA : [...previousManualA, player],
      )
    } else if (target === 'b') {
      setManualB((previousManualB) =>
        previousManualB.length >= playersPerTeam ? previousManualB : [...previousManualB, player],
      )
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
            convocatoria={convocatoria}
            onConvocatoriaChange={canManage && !openMatch ? setConvocatoria : null}
            lockMatchType={openMatch !== null}
            openMatchForm={
              matchType && (
                <OpenMatchForm
                  matchType={matchType}
                  draft={draft}
                  onDraftChange={(changes) => setDraft((previousDraft) => ({ ...previousDraft, ...changes }))}
                  isFriendly={isFriendly}
                  onFriendlyToggle={() => setIsFriendly((wasFriendly) => !wasFriendly)}
                />
              )
            }
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
            onDraftChange={(changes) => setDraft((previousDraft) => ({ ...previousDraft, ...changes }))}
            onRegenerate={generateTeams}
            openMatchId={openMatch?.id ?? null}
          />
        )
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <PageTitle
        spacing={0}
        className="mb-4 sm:mb-0"
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

      {openMatch && (
        <p
          className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-gray-800"
          role="status"
        >
          Armando equipos para el partido abierto con los {splitSignups(openMatch).confirmed.length} inscriptos.
        </p>
      )}

      <div className={`sticky top-0 z-10 bg-gray-50 sm:pt-4 ${convocatoria === 'open' ? 'hidden' : ''}`}>
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
