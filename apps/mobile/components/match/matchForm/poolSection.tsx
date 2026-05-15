import type { Player } from '@fulbito/types'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { BottomSheet } from './bottomSheet'
import { FormLabel } from './formLabel'
import { sheetStyles } from './sharedStyles'

type Props = {
  players: Player[]
  poolPlayers: Player[]
  poolIds: Set<string>
  maxSize: number
  onConfirm: (ids: Set<string>) => void
}

export function PoolSection({ players, poolPlayers, poolIds, maxSize, onConfirm }: Props) {
  const { colors, radii } = useAppTheme()
  const [open, setOpen] = useState(false)
  const [draftIds, setDraftIds] = useState<Set<string>>(new Set())

  const openModal = () => {
    setDraftIds(new Set(poolIds))
    setOpen(true)
  }

  const toggle = (id: string) => {
    setDraftIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < maxSize) next.add(id)
      return next
    })
  }

  const confirm = () => {
    onConfirm(new Set(draftIds))
    setOpen(false)
  }

  return (
    <>
      <FormLabel text={`Jugadores (${poolIds.size})`} />
      <TouchableOpacity
        onPress={openModal}
        style={[
          styles.box,
          { borderColor: poolIds.size > 0 ? colors.brand : colors.border, borderRadius: radii.sm },
        ]}
      >
        {poolIds.size === 0 ? (
          <Text style={[styles.placeholder, { color: colors.muted }]}>
            Tocá para seleccionar jugadores...
          </Text>
        ) : (
          <View style={styles.chipsWrap}>
            {poolPlayers.map((p) => (
              <View
                key={p.id}
                style={[styles.chip, { backgroundColor: colors.brandSoft, borderRadius: radii.pill }]}
              >
                <Text style={[styles.chipText, { color: colors.brand }]}>{p.name}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      <BottomSheet
        visible={open}
        title={`Jugadores (${draftIds.size}/${maxSize})`}
        onConfirm={confirm}
        onDismiss={() => setOpen(false)}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          {players.map((p) => {
            const selected = draftIds.has(p.id)
            return (
              <TouchableOpacity
                key={p.id}
                style={[sheetStyles.option, { borderBottomColor: colors.border }]}
                onPress={() => toggle(p.id)}
              >
                <Text style={[sheetStyles.optionText, { color: colors.text }]}>{p.name}</Text>
                {selected && (
                  <Text style={{ color: colors.brand, fontWeight: '700', fontSize: 16 }}>✓</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </BottomSheet>
    </>
  )
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 14,
    textAlign: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
