import { useMatchStore, usePlayerStore } from '@fulbito/state'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

/**
 * Al enfocar la pestaña, vuelve a cargar jugadores y partidos desde el mismo API que la web.
 */
export function useFulbitoTabDataReload() {
  const initPlayers = usePlayerStore((s) => s.initLoad)
  const initMatches = useMatchStore((s) => s.initLoad)

  useFocusEffect(
    useCallback(() => {
      void initPlayers({ force: true })
      void initMatches({ force: true })
    }, [initPlayers, initMatches]),
  )
}
