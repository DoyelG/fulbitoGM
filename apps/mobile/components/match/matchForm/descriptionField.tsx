import { TextInput } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { FormLabel } from './formLabel'
import { fieldStyles } from './sharedStyles'

type Props = {
  value: string,
  onChange: (v: string) => void,
}

export function DescriptionField({ value, onChange }: Props) {
  const { colors, radii } = useAppTheme()

  return (
    <>
      <FormLabel text="Descripción" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Ej: Salió la ficha del partido, puntajes duros pero justos. El MVP..."
        placeholderTextColor={colors.muted}
        style={[fieldStyles.textInput, { borderColor: colors.border, borderRadius: radii.sm, color: colors.text }]}
      />
    </>
  )
}
