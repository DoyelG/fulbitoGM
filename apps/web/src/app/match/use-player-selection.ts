import { useState } from 'react'
import { MAX_GOALKEEPERS } from '@fulbito/utils'

type Options = {
  onDeselect?: (playerId: string) => void
}

export function usePlayerSelection({ onDeselect }: Options = {}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [goalkeeperIds, setGoalkeeperIds] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    const wasSelected = selected.has(id)
    setSelected((prev) => {
      const nextSelected = new Set(prev)
      if (nextSelected.has(id)) nextSelected.delete(id)
      else nextSelected.add(id)
      return nextSelected
    })
    if (!wasSelected) return

    setGoalkeeperIds((prev) => {
      if (!prev.has(id)) return prev
      const nextGoalkeeperIds = new Set(prev)
      nextGoalkeeperIds.delete(id)
      return nextGoalkeeperIds
    })
    onDeselect?.(id)
  }

  const toggleGoalkeeper = (id: string) => {
    setGoalkeeperIds((prev) => {
      const nextGoalkeeperIds = new Set(prev)
      if (nextGoalkeeperIds.has(id)) {
        nextGoalkeeperIds.delete(id)
      } else {
        if (nextGoalkeeperIds.size >= MAX_GOALKEEPERS) return prev
        nextGoalkeeperIds.add(id)
      }
      return nextGoalkeeperIds
    })
  }

  const reset = () => {
    setSelected(new Set())
    setGoalkeeperIds(new Set())
  }

  return { selected, goalkeeperIds, toggleSelect, toggleGoalkeeper, reset }
}

export type PlayerSelection = ReturnType<typeof usePlayerSelection>
