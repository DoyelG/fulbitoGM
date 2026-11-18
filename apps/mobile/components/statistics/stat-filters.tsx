import { Ionicons } from '@expo/vector-icons'
import type { MatchFilters, MatchKindFilter } from '@fulbito/utils'
import { useState } from 'react'
import { Pressable, ScrollView, TouchableOpacity, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'
import type { PlayerStatusFilter } from './stat-status-filter'
import { styles } from './styles/stat-filters.styles'
import { styles as buttonStyles } from './styles/stat-status-filter.styles'
import { StatMatchTypeFilter } from './stat-match-type-filter'
import { StatSelectFilter, type StatFilterOption } from './stat-select-filter'

type Props = {
  playerStatus: PlayerStatusFilter
  onPlayerStatusChange: (value: PlayerStatusFilter) => void
  filters: MatchFilters
  onFiltersChange: (value: MatchFilters) => void
  years: number[]
  onClear: () => void
}

const STATUS_OPTIONS: StatFilterOption<PlayerStatusFilter>[] = [
  { value: 'all', label: 'Todos los jugadores' },
  { value: 'active', label: 'Solo los activos' },
  { value: 'inactive', label: 'Solo los inactivos' },
]

const KIND_OPTIONS: StatFilterOption<MatchKindFilter>[] = [
  { value: 'all', label: 'Todos los partidos' },
  { value: 'competitive', label: 'Competitivos' },
  { value: 'friendly', label: 'Amistosos' },
]

export function StatFilters({ playerStatus, onPlayerStatusChange, filters, onFiltersChange, years, onClear }: Props) {
  const { colors, radii, spacing, isDark } = useAppTheme()
  const [open, setOpen] = useState(false)

  const activeCount = [
    filters.types.length > 0,
    filters.kind !== 'all',
    filters.year !== 'all',
    playerStatus !== 'all',
  ].filter(Boolean).length
  const hasActiveFilters = activeCount > 0
  const textColor = hasActiveFilters ? colors.primaryText : isDark ? colors.text : colors.muted
  const buttonLabel = activeCount > 0 ? `Filtros (${activeCount})` : 'Filtros'

  const yearOptions: StatFilterOption<string>[] = [
    { value: 'all', label: 'Todos los años' },
    ...years.map((year) => ({ value: String(year), label: String(year) })),
  ]

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        accessibilityHint="Abre los filtros de estadísticas"
        style={[
          buttonStyles.select,
          {
            backgroundColor: hasActiveFilters ? colors.primarySoft : colors.chipBg,
            borderColor: hasActiveFilters ? colors.primaryText : colors.chipBorder,
            borderRadius: radii.pill,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Ionicons name="options-outline" size={16} color={textColor} style={buttonStyles.icon} />
        <ThemedText style={[buttonStyles.selectText, { color: textColor }]}>{buttonLabel}</ThemedText>
      </TouchableOpacity>

      <BottomSheet visible={open} title="Filtros" onConfirm={() => setOpen(false)}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.body}>
          <View style={[styles.card, { backgroundColor: colors.chipBg }]}>
            <StatMatchTypeFilter
              value={filters.types}
              onChange={(types) => onFiltersChange({ ...filters, types })}
              divider
            />
            <StatSelectFilter
              label="Tipo de partido"
              value={filters.kind}
              options={KIND_OPTIONS}
              onChange={(kind) => onFiltersChange({ ...filters, kind })}
            />
          </View>

          <View style={[styles.card, { backgroundColor: colors.chipBg }]}>
            <StatSelectFilter
              label="Año"
              value={String(filters.year)}
              options={yearOptions}
              onChange={(year) => onFiltersChange({ ...filters, year: year === 'all' ? 'all' : Number(year) })}
            />
          </View>

          <View style={[styles.card, { backgroundColor: colors.chipBg }]}>
            <StatSelectFilter
              label="Estado del jugador"
              value={playerStatus}
              options={STATUS_OPTIONS}
              onChange={onPlayerStatusChange}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={onClear}
            disabled={activeCount === 0}
            accessibilityRole="button"
            accessibilityLabel="Limpiar todos los filtros"
            accessibilityState={{ disabled: activeCount === 0 }}
            style={[styles.footerButton, { borderColor: colors.border, opacity: activeCount === 0 ? 0.4 : 1 }]}
          >
            <ThemedText style={styles.footerButtonText}>
              {activeCount > 0 ? `Limpiar filtros (${activeCount})` : 'Limpiar filtros'}
            </ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  )
}
