import { Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import type { SortTabKey } from '@/hooks/use-player-statistics'

type Props = {
  activeTab: SortTabKey
  onChange: (tab: SortTabKey) => void
}

const TABS: Array<{ key: SortTabKey; label: string }> = [
  { key: 'goals', label: 'Goles' },
  { key: 'matches', label: 'Partidos' },
  { key: 'totalPerformance', label: 'Rendimiento' },
  { key: 'winRate', label: '% Victorias' },
]

export function StatFilterTabs({ activeTab, onChange }: Props) {
  const { colors, radii, spacing, shadows, isDark } = useAppTheme()

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
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
                  backgroundColor: selected ? colors.brand : colors.chipBg,
                  borderColor: selected ? colors.brand : colors.chipBorder,
                },
                selected && shadows.pill(),
                pressed && { opacity: 0.9 },
              ]}>
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

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    marginBottom: 4,
  },
  content: {
    gap: 8,
    paddingRight: 16,
  },
  tab: {
    minHeight: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
})
