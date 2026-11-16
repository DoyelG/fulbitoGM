import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet } from 'react-native'
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg'

import { PrimaryColors } from '@/constants/theme'

export function PrimaryGradient() {
  return (
    <>
      <LinearGradient
        colors={PrimaryColors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="primaryGlow" cx="50%" cy="-30%" rx="60%" ry="130%">
            <Stop offset="0" stopColor={PrimaryColors.glow} stopOpacity={PrimaryColors.glowOpacity} />
            <Stop offset="1" stopColor={PrimaryColors.glow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#primaryGlow)" />
      </Svg>
    </>
  )
}
