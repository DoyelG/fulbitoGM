import type { Player } from '@fulbito/types'
import { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { BottomSheet } from './bottomSheet'
import { FormLabel } from './formLabel'
import { fieldStyles, sheetStyles } from './sharedStyles'
import type { RecordingPlayer } from './types'

type Props = {
  players: Player[]
  shirtsResponsibleId: string | null
  onChange: (id: string | null) => void
  teamPlayers: RecordingPlayer[]
  playedBefore: Set<string>
  dutiesById: Map<string, number>
}

export function ShirtsSection({
  players,
  shirtsResponsibleId,
  onChange,
  teamPlayers,
  playedBefore,
  dutiesById,
}: Props) {
  const { colors, radii } = useAppTheme()
  const [open, setOpen] = useState(false)

  const responsibleName = shirtsResponsibleId
    ? (players.find((p) => p.id === shirtsResponsibleId)?.name ?? 'Seleccionar')
    : 'Seleccionar jugador'

  const eligible = teamPlayers.some((p) => playedBefore.has(p.id))
  const options = [
    { id: '', name: 'Sin seleccionar', disabled: false, duties: 0 },
    ...teamPlayers.map((p) => {
      const duties = dutiesById.get(p.id) ?? 0
      const isNew = eligible && !playedBefore.has(p.id)
      return {
        id: p.id,
        name: `${p.name} (#${duties})${isNew ? ' — nuevo' : ''}`,
        disabled: isNew,
        duties,
      }
    }),
  ]

  const pickRandom = () => {
    const candidates = options.filter((o) => o.id !== '' && !o.disabled)
    if (candidates.length === 0) return
    const minDuties = Math.min(...candidates.map((c) => (c as { duties: number }).duties))
    const pool = candidates.filter((c) => (c as { duties: number }).duties === minDuties)
    const picked = pool[Math.floor(Math.random() * pool.length)]
    onChange(picked.id)
  }

  return (
    <>
      <FormLabel text="Encargado de camisetas" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={[fieldStyles.inputBtn, { borderColor: colors.border, borderRadius: radii.sm, flex: 1 }]}
        >
          <Text style={[fieldStyles.inputBtnText, { color: colors.text }]}>{responsibleName}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={pickRandom}
          style={[
            { borderRadius: radii.sm, paddingHorizontal: 14, backgroundColor: colors.brand, justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text style={{ fontSize: 18, color: '#fff' }}>✦</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet
        visible={open}
        title="Encargado de camisetas"
        closeLabel="Cerrar"
        onConfirm={() => setOpen(false)}
      >
        <ScrollView style={{ maxHeight: 300 }}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              disabled={opt.disabled}
              onPress={() => {
                onChange(opt.id || null)
                setOpen(false)
              }}
              style={[
                sheetStyles.option,
                { borderBottomColor: colors.border },
                shirtsResponsibleId === opt.id && { backgroundColor: colors.brandSoft },
              ]}
            >
              <Text
                style={[
                  sheetStyles.optionText,
                  { color: opt.disabled ? colors.muted : colors.text },
                ]}
              >
                {opt.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BottomSheet>
    </>
  )
}
