import type { ReactNode } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { ThemedText } from '@/components/themed-text'
import { PrimaryColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import type { SortTabKey } from '@/hooks/use-player-statistics'
import { styles } from './styles/stat-filter-tabs.styles'

type Props = {
  activeTab: SortTabKey
  onChange: (tab: SortTabKey) => void
  leading?: ReactNode
}

const TABS: { key: SortTabKey; label: string }[] = [
  { key: 'goals', label: 'Goles' },
  { key: 'matches', label: 'Partidos' },
  { key: 'totalPerformance', label: 'Rendimiento' },
  { key: 'winRate', label: '% Victorias' },
  { key: 'mvps', label: 'MVP' },
]

export function StatFilterTabs({ activeTab, onChange, leading }: Props) {
  const { colors, radii, spacing, isDark } = useAppTheme()

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {leading}
        {TABS.map((tab) => {
          const selected = activeTab === tab.key
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={({ pressed }) => [
                styles.tab,
                {
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.lg,
                  backgroundColor: selected ? undefined : colors.chipBg,
                  borderColor: selected ? PrimaryColors.border : colors.chipBorder,
                },
                pressed && { opacity: 0.9 },
              ]}>
              {selected && <PrimaryGradient />}
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.tabText,
                  { color: selected ? '#ffffff' : isDark ? colors.text : '#4b5563' },
                ]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
