import { useState } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { BottomSheet } from './bottomSheet'
import { FormLabel } from './formLabel'
import { fieldStyles, sheetStyles } from './sharedStyles'
import type { RecordingPlayer } from './types'

type Props = {
  teamA: RecordingPlayer[]
  teamB: RecordingPlayer[]
  mvpId: string | null
  onChange: (id: string | null) => void
  goalsA: Record<string, string>
  goalsB: Record<string, string>
  perfA: Record<string, string>
  perfB: Record<string, string>
}

export function MvpSection({ teamA, teamB, mvpId, onChange, goalsA, goalsB, perfA, perfB }: Props) {
  const { colors, radii } = useAppTheme()
  const [open, setOpen] = useState(false)

  const current = [...teamA, ...teamB]
  const empty = current.length === 0

  const statsFor = (id: string) => ({
    goals: parseInt(goalsA[id] ?? goalsB[id] ?? '0') || 0,
    perf: parseFloat(perfA[id] ?? perfB[id] ?? '0') || 0,
  })

  // Sugerencia: jugador con mejor rendimiento del partido
  const suggestedId = current.reduce<{ id: string; perf: number } | null>((best, p) => {
    const { perf } = statsFor(p.id)
    if (perf > 0 && (!best || perf > best.perf)) return { id: p.id, perf }
    return best
  }, null)?.id

  const mvpName = mvpId ? (current.find((p) => p.id === mvpId)?.name ?? '—') : 'Sin MVP'

  return (
    <>
      <FormLabel text="MVP del partido" />
      <TouchableOpacity
        onPress={() => setOpen(true)}
        disabled={empty}
        accessibilityRole="button"
        accessibilityLabel="Elegir MVP del partido"
        style={[
          fieldStyles.inputBtn,
          { borderColor: colors.border, borderRadius: radii.sm, opacity: empty ? 0.5 : 1 },
        ]}
      >
        <Text style={[fieldStyles.inputBtnText, { color: colors.text }]}>
          🏆 {empty ? 'Armá los equipos primero' : mvpName}
        </Text>
      </TouchableOpacity>

      <BottomSheet visible={open} title="MVP del partido" closeLabel="Listo" onConfirm={() => setOpen(false)}>
        <ScrollView style={{ maxHeight: 320 }}>
          <TouchableOpacity
            onPress={() => {
              onChange(null)
              setOpen(false)
            }}
            style={[
              sheetStyles.option,
              { borderBottomColor: colors.border },
              mvpId === null && { backgroundColor: colors.brandSoft },
            ]}
          >
            <Text style={[sheetStyles.optionText, { color: colors.text }]}>Sin MVP</Text>
          </TouchableOpacity>
          {current.map((p) => {
            const { goals, perf } = statsFor(p.id)
            const suggested = p.id === suggestedId
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => {
                  onChange(p.id)
                  setOpen(false)
                }}
                style={[
                  sheetStyles.option,
                  { borderBottomColor: colors.border },
                  mvpId === p.id && { backgroundColor: colors.brandSoft },
                ]}
              >
                <Text style={[sheetStyles.optionText, { color: colors.text }]}>
                  {p.name}
                  {suggested ? ' · sugerido' : ''}
                </Text>
                <Text style={[sheetStyles.optionText, { color: colors.muted }]}>
                  ⚽ {goals} · ★ {perf}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </BottomSheet>
    </>
  )
}
