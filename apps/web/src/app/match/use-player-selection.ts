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
    setSelected((previousSelected) => {
      const nextSelected = new Set(previousSelected)
      if (nextSelected.has(id)) nextSelected.delete(id)
      else nextSelected.add(id)
      return nextSelected
    })
    if (!wasSelected) return

    setGoalkeeperIds((previousGoalkeeperIds) => {
      if (!previousGoalkeeperIds.has(id)) return previousGoalkeeperIds
      const nextGoalkeeperIds = new Set(previousGoalkeeperIds)
      nextGoalkeeperIds.delete(id)
      return nextGoalkeeperIds
    })
    onDeselect?.(id)
  }

  const toggleGoalkeeper = (id: string) => {
    setGoalkeeperIds((previousGoalkeeperIds) => {
      const nextGoalkeeperIds = new Set(previousGoalkeeperIds)
      if (nextGoalkeeperIds.has(id)) {
        nextGoalkeeperIds.delete(id)
      } else {
        if (nextGoalkeeperIds.size >= MAX_GOALKEEPERS) return previousGoalkeeperIds
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
