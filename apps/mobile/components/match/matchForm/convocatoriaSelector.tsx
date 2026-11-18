import type { Convocatoria } from '@fulbito/utils'
import { Text, TouchableOpacity, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { ContrastColors, PrimaryColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './convocatoriaSelector.styles'
import { FormLabel } from './formLabel'

type Props = {
  value: Convocatoria
  onChange: (value: Convocatoria) => void
}

const OPTIONS: { value: Convocatoria; label: string }[] = [
  { value: 'preselected', label: 'Jugadores preseleccionados' },
  { value: 'open', label: 'Partido abierto' },
]

export function ConvocatoriaSelector({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()

  return (
    <>
      <FormLabel text="Convocatoria" />
      <View style={styles.row} accessibilityRole="radiogroup">
        {OPTIONS.map((option) => {
          const active = option.value === value
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
              style={[
                styles.chip,
                { borderColor: active ? PrimaryColors.border : colors.border, borderRadius: radii.sm },
              ]}
            >
              {active && <PrimaryGradient />}
              <Text style={[styles.chipText, { color: active ? ContrastColors.onColor : colors.muted }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      <Text style={[styles.hint, { color: colors.muted }]}>
        {value === 'open'
          ? 'Los jugadores del torneo se anotan solos. La hora es obligatoria: desde 24 hs antes ya nadie puede bajarse.'
          : 'Elegís vos los jugadores y armás los equipos ahora.'}
      </Text>
    </>
  )
}
