import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import type { Match, PitchPosition, Player } from '@fulbito/types'
import { hasPitchChanges, resolveTeamPositions, withPitchPositions, type PitchSide } from '@fulbito/utils'
import { useNavigation, usePreventRemove } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { AccessibilityInfo, ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated'

import { MatchPitch } from '@/components/pitch/match-pitch'
import { PitchCard } from '@/components/pitch/pitch-card'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './match-pitch-section.styles'

type Props = {
  match: Match
  players: Player[]
  matches: Match[]
  editable: boolean
  onSave: (positions: Record<string, PitchPosition>) => Promise<void>
  onDraggingChange: (dragging: boolean) => void
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type LeaveAction = Parameters<NonNullable<Parameters<typeof usePreventRemove>[1]>>[0]['data']['action']

const SAVED_VISIBLE_MS = 3000
const BUTTON_ANIMATION_MS = 180
const SAVED_MESSAGE = 'Posiciones guardadas'
const ERROR_MESSAGE = 'No se pudieron guardar las posiciones'

export function MatchPitchSection({ match, players, matches, editable, onSave, onDraggingChange }: Props) {
  const { colors } = useAppTheme()
  const navigation = useNavigation()
  const roleById = useMemo(() => Object.fromEntries(players.map((player) => [player.id, player.position])), [players])
  const [edits, setEdits] = useState<Record<string, PitchPosition>>({})
  const [status, setStatus] = useState<SaveStatus>('idle')
  const [leaveAction, setLeaveAction] = useState<LeaveAction | null>(null)
  const goalkeeperIds = match.goalkeeperIds ?? []
  const teamA = withPitchPositions(match.teamA, edits)
  const teamB = withPitchPositions(match.teamB, edits)
  const originalPositions = {
    ...resolveTeamPositions(match.teamA, goalkeeperIds, 'A', roleById),
    ...resolveTeamPositions(match.teamB, goalkeeperIds, 'B', roleById),
  }
  const isDirty = hasPitchChanges(originalPositions, edits)
  const isSaving = status === 'saving'
  const isSaved = status === 'saved'

  useEffect(() => {
    if (status !== 'saved') return
    AccessibilityInfo.announceForAccessibility(SAVED_MESSAGE)
    const timer = setTimeout(() => setStatus('idle'), SAVED_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (!leaveAction || isDirty) return
    navigation.dispatch(leaveAction)
  }, [leaveAction, isDirty, navigation])

  const movePlayer = (playerId: string, _side: PitchSide, position: PitchPosition) => {
    setEdits((previous) => ({ ...previous, [playerId]: position }))
    setStatus('idle')
  }

  const savePositions = async (): Promise<boolean> => {
    setStatus('saving')
    try {
      await onSave({
        ...resolveTeamPositions(teamA, goalkeeperIds, 'A', roleById),
        ...resolveTeamPositions(teamB, goalkeeperIds, 'B', roleById),
      })
      setEdits({})
      setStatus('saved')
      return true
    } catch {
      setStatus('error')
      return false
    }
  }

  const discardEdits = () => {
    setEdits({})
    setStatus('idle')
  }

  usePreventRemove(editable && isDirty, ({ data }) => {
    Alert.alert('Cambios sin guardar', 'Moviste fichas en la cancha y no guardaste las posiciones.', [
      { text: 'Seguir editando', style: 'cancel' },
      {
        text: 'Descartar cambios',
        style: 'destructive',
        onPress: () => {
          setEdits({})
          setLeaveAction(data.action)
        },
      },
      {
        text: 'Guardar cambios',
        onPress: async () => {
          if (await savePositions()) setLeaveAction(data.action)
        },
      },
    ])
  })

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
            CANCHA
          </Text>
          {editable && (
            <Text style={[styles.hint, { color: colors.muted }]}>
              Arrastrá las fichas para reflejar dónde jugó cada uno
            </Text>
          )}
        </View>
      </View>
      <PitchCard>
        <MatchPitch
          teamA={teamA}
          teamB={teamB}
          players={players}
          matches={matches}
          mvpId={match.mvpId}
          goalkeeperIds={goalkeeperIds}
          showMatchStats={match.status !== 'draft'}
          onPlayerMove={editable ? movePlayer : undefined}
          onDraggingChange={onDraggingChange}
        />
        {editable && isDirty && !isSaving && (
          <Animated.View
            style={[styles.saveBtn, styles.cancelBtn]}
            entering={ZoomIn.duration(BUTTON_ANIMATION_MS)}
            exiting={ZoomOut.duration(BUTTON_ANIMATION_MS)}
          >
            <Pressable
              onPress={discardEdits}
              style={styles.saveBtnContent}
              accessibilityRole="button"
              accessibilityLabel="Descartar cambios"
            >
              <MaterialIcons name="close" size={24} color={colors.primary} />
            </Pressable>
          </Animated.View>
        )}
        {editable && (isSaved || isDirty) && (
          <Animated.View
            style={styles.saveBtn}
            entering={ZoomIn.duration(BUTTON_ANIMATION_MS)}
            exiting={ZoomOut.duration(BUTTON_ANIMATION_MS)}
          >
            {isSaved ? (
              <View style={styles.saveBtnContent} accessible={false}>
                <MaterialIcons name="check" size={24} color={colors.primary} />
              </View>
            ) : (
              <Pressable
                onPress={() => void savePositions()}
                disabled={isSaving}
                style={styles.saveBtnContent}
                accessibilityRole="button"
                accessibilityLabel={isSaving ? 'Guardando posiciones' : 'Guardar posiciones'}
                accessibilityState={{ disabled: isSaving, busy: isSaving }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <MaterialIcons name="save" size={22} color={colors.primary} />
                )}
              </Pressable>
            )}
          </Animated.View>
        )}
      </PitchCard>
      {editable && status === 'error' && (
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.danger }]}>
          {ERROR_MESSAGE}
        </Text>
      )}
    </View>
  )
}
