import type { Player } from '@fulbito/types'
import { useMemo, useState } from 'react'

import type { PositionFilter } from '@/components/players/position-filter-row'

type Filters = {
  query: string
  setQuery: (v: string) => void
  position: PositionFilter
  setPosition: (v: PositionFilter) => void
  positions: string[]
  filteredPlayers: Player[]
}

/** Filtro combinado por nombre + posición. Expone además las posiciones disponibles. */
export function usePlayerFilters(players: Player[]): Filters {
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState<PositionFilter>(null)

  const positions = useMemo(() => {
    const set = new Set(players.map((p) => p.position).filter(Boolean))
    return Array.from(set)
  }, [players])

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return players.filter((p) => {
      if (position && p.position !== position) return false
      if (q && !p.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [players, query, position])

  return { query, setQuery, position, setPosition, positions, filteredPlayers }
}
