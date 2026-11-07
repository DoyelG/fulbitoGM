import type { Address } from '@fulbito/types'
import { useCallback } from 'react'
import { getAddresses, deleteAddress } from '@fulbito/firebase'

import { useActiveTournamentId } from '@/contexts/TournamentContext'
import { useTournamentResource } from '@/hooks/use-tournament-resource'

export type AddressesDataState = {
  addresses: Address[]
  error: string | null
  reload: () => Promise<void>
  deleteAddress: (id: string) => Promise<void>
}

const EMPTY_ADDRESSES: Address[] = []

export function useAddressesData(): AddressesDataState {
  const tournamentId = useActiveTournamentId()
  const {
    data: addresses,
    error,
    reload,
  } = useTournamentResource(tournamentId, getAddresses, EMPTY_ADDRESSES, 'Error al cargar las canchas')

  const handleDeleteAddress = useCallback(
    async (id: string) => {
      await deleteAddress(id)
      await reload()
    },
    [reload],
  )

  return { addresses, error, reload, deleteAddress: handleDeleteAddress }
}
