import { View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './link-player-step-dots.styles'

type Props = {
  current: number
  total: number
}

export default function LinkPlayerStepDots({ current, total }: Props) {
  const { colors } = useAppTheme()

  return (
    <View style={styles.container} accessible accessibilityLabel={`Paso ${current} de ${total}`}>
      {Array.from({ length: total }, (_, index) => {
        const isCurrent = index + 1 === current
        const isDone = index + 1 < current
        return (
          <View
            key={index}
            style={[
              styles.dot,
              { width: isCurrent ? 32 : 16, backgroundColor: isCurrent || isDone ? colors.brand : colors.chipBg },
              isDone && { opacity: 0.5 },
            ]}
          />
        )
      })}
    </View>
  )
}
