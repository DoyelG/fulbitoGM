import type { Player } from '@fulbito/types'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { FormLabel } from './formLabel'

type Props = {
  poolPlayers: Player[]
  goalkeeperIds: Set<string>
  maxSize: number
  onToggle: (id: string) => void
}

export function GoalkeeperSection({ poolPlayers, goalkeeperIds, maxSize, onToggle }: Props) {
  const { colors, radii } = useAppTheme()

  return (
    <>
      <FormLabel text={`Arqueros (${goalkeeperIds.size}/${maxSize})`} />
      {poolPlayers.length === 0 ? (
        <Text style={[styles.hint, { color: colors.muted }]}>
          Seleccioná jugadores arriba para elegir arqueros.
        </Text>
      ) : (
        <View style={styles.chipsWrap}>
          {poolPlayers.map((p) => {
            const active = goalkeeperIds.has(p.id)
            const disabled = !active && goalkeeperIds.size >= maxSize
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => onToggle(p.id)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityState={{ selected: active, disabled }}
                accessibilityLabel={
                  active ? `Quitar a ${p.name} como arquero` : `Marcar a ${p.name} como arquero`
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.brand : 'transparent',
                    borderColor: active ? colors.brand : colors.border,
                    borderRadius: radii.pill,
                    opacity: disabled ? 0.4 : 1,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? '#fff' : colors.muted }]}>
                  🧤 {p.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  hint: {
    fontSize: 13,
    paddingVertical: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
})
