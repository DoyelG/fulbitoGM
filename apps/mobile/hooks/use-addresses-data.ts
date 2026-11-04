import type { Address } from '@fulbito/types'
import { useCallback, useEffect, useState } from 'react'
import { getAddresses, deleteAddress } from '@fulbito/firebase'

import { useActiveTournamentId } from '@/contexts/TournamentContext'

export type AddressesDataState = {
  addresses: Address[]
  error: string | null
  reload: () => Promise<void>
  deleteAddress: (id: string) => Promise<void>
}

export function useAddressesData(): AddressesDataState {
  const tournamentId = useActiveTournamentId()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!tournamentId) return
    setError(null)
    try {
      setAddresses(await getAddresses(tournamentId))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Error al cargar las canchas')
    }
  }, [tournamentId])

  const handleDeleteAddress = useCallback(
    async (id: string) => {
      await deleteAddress(id)
      await reload()
    },
    [reload],
  )

  useEffect(() => {
    setAddresses([])
    void reload()
  }, [reload])

  return { addresses, error, reload, deleteAddress: handleDeleteAddress }
}
