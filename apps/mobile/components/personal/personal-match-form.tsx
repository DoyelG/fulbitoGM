import type { MatchInput, MatchType } from '@fulbito/types'
import { toLocalDay } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { DateField } from '@/components/match/matchForm/dateField'
import { FormLabel } from '@/components/match/matchForm/formLabel'
import { TypeSelector } from '@/components/match/matchForm/typeSelector'
import { ProfileButton } from '@/components/profile/profile-button'
import { formStyles } from '@/components/profile/profile-form.styles'
import { useMyPlayerId, useTournaments } from '@/contexts/TournamentContext'
import { useAppTheme } from '@/hooks/use-theme'
import { useMatchesData } from '@/hooks/use-matches-data'

import { styles } from './personal-match-form.styles'

const MAX_SCORE = 99
const MAX_OPPONENT_LENGTH = 60

function toNumber(value: string, min: number, max: number): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? min : Math.min(max, Math.max(min, parsed))
}

type NumberFieldProps = { label: string; value: string; onChange: (value: string) => void }

function NumberField({ label, value, onChange }: NumberFieldProps) {
  const { colors } = useAppTheme()
  return (
    <View style={styles.cell}>
      <FormLabel text={label} />
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={2}
        accessibilityLabel={label}
        style={[formStyles.input, { backgroundColor: colors.chipBg, borderColor: colors.border, color: colors.text }]}
      />
    </View>
  )
}

export function PersonalMatchForm() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { activeTournament } = useTournaments()
  const playerId = useMyPlayerId()
  const { addMatch } = useMatchesData()
  const [date, setDate] = useState(() => toLocalDay(new Date()))
  const [type, setType] = useState<MatchType>('5v5')
  const [myScore, setMyScore] = useState('0')
  const [opponentScore, setOpponentScore] = useState('0')
  const [opponentName, setOpponentName] = useState('')
  const [goals, setGoals] = useState('0')
  const [performance, setPerformance] = useState('5')
  const [isFriendly, setIsFriendly] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!playerId) {
      setError('Tu jugador personal todavía no está listo. Volvé a abrir la app.')
      return
    }
    setSaving(true)
    setError(null)
    const match: MatchInput = {
      date: new Date(`${date}T12:00:00`).toISOString(),
      type,
      status: 'final',
      teamAScore: toNumber(myScore, 0, MAX_SCORE),
      teamBScore: toNumber(opponentScore, 0, MAX_SCORE),
      teamA: [
        {
          id: playerId,
          name: activeTournament?.tournament.name ?? '',
          goals: toNumber(goals, 0, MAX_SCORE),
          performance: toNumber(performance, 1, 10),
        },
      ],
      teamB: [],
      opponentName: opponentName.trim() || undefined,
      isFriendly,
    }
    try {
      const matchId = await addMatch(match)
      router.navigate({ pathname: '/(tabs)/history/[id]', params: { id: matchId } })
    } catch {
      setError('No se pudo guardar el partido. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={[]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            REGISTRAR PARTIDO
          </Text>
          <View>
            <DateField value={date} onChange={setDate} />
          </View>
          <View>
            <TypeSelector value={type} onChange={setType} />
          </View>
          <View style={styles.row}>
            <NumberField label="Goles de mi equipo" value={myScore} onChange={setMyScore} />
            <NumberField label="Goles del rival" value={opponentScore} onChange={setOpponentScore} />
          </View>
          <View>
            <FormLabel text="Rival (opcional)" />
            <TextInput
              value={opponentName}
              onChangeText={setOpponentName}
              maxLength={MAX_OPPONENT_LENGTH}
              accessibilityLabel="Nombre del rival"
              style={[
                formStyles.input,
                { backgroundColor: colors.chipBg, borderColor: colors.border, color: colors.text },
              ]}
            />
          </View>
          <View style={styles.row}>
            <NumberField label="Mis goles" value={goals} onChange={setGoals} />
            <NumberField label="Mi rendimiento (1 a 10)" value={performance} onChange={setPerformance} />
          </View>
          <View style={[styles.friendlyRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.friendlyLabel, { color: colors.text }]}>Partido amistoso</Text>
            <Switch
              value={isFriendly}
              onValueChange={setIsFriendly}
              style={styles.friendlySwitch}
              accessibilityLabel="Partido amistoso"
              trackColor={{ true: colors.primary }}
            />
          </View>
          {error && (
            <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
          <ProfileButton
            label={saving ? 'Guardando...' : 'Guardar partido'}
            onPress={() => void handleSave()}
            disabled={saving || !playerId}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
