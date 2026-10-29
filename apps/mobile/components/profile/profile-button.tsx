import { Text, TouchableOpacity } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './profile-button.styles'

type Props = {
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'dangerousSecondary'
  disabled?: boolean
}

export function ProfileButton({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const { colors } = useAppTheme()
  const variantColors = {
    primary: { background: colors.brand, text: '#fff', border: colors.brand },
    secondary: { background: colors.brandSoft, text: colors.brand, border: colors.brandSoft },
    dangerousSecondary: { background: colors.surface, text: colors.danger, border: colors.danger },
  }[variant]

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        { backgroundColor: variantColors.background, borderColor: variantColors.border, opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Text style={[styles.label, { color: variantColors.text }]}>{label}</Text>
    </TouchableOpacity>
  )
}
