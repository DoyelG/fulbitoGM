import { StyleSheet } from 'react-native'
import Svg, { Circle, G, Path, Rect } from 'react-native-svg'

import { PitchColors } from '@/constants/theme'

type Props = { aspectRatio: number }

const WIDTH = 400

export function PitchLines({ aspectRatio }: Props) {
  const length = WIDTH / aspectRatio
  const area = length * 0.12
  const smallArea = length * 0.045
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox={`0 0 400 ${length}`}
      preserveAspectRatio="none"
      pointerEvents="none"
      accessible={false}
    >
      <G fill="none" stroke={PitchColors.line} strokeWidth={2} vectorEffect="non-scaling-stroke">
        <Path d={`M0 ${length / 2}H400`} />
        <Circle cx="200" cy={length / 2} r="78" />
        <Rect x="100" y="0" width="200" height={area} />
        <Rect x="100" y={length - area} width="200" height={area} />
        <Rect x="150" y="0" width="100" height={smallArea} />
        <Rect x="150" y={length - smallArea} width="100" height={smallArea} />
        <Path d={`M160 ${area}A40 40 0 0 0 240 ${area}`} />
        <Path d={`M160 ${length - area}A40 40 0 0 1 240 ${length - area}`} />
      </G>
    </Svg>
  )
}
