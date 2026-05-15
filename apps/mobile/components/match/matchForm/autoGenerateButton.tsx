import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  poolSize: number
  playersPerTeam: number
  onPress: () => void
}

export function AutoGenerateButton({ poolSize, playersPerTeam, onPress }: Props) {
  const { colors, radii } = useAppTheme()
  const enabled = poolSize >= playersPerTeam * 2

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!enabled}
      style={[
        styles.btn,
        {
          backgroundColor: enabled ? colors.brand : colors.border,
          borderRadius: radii.sm,
        },
      ]}
    >
      <Text style={styles.text}>Autocompletar</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
})
