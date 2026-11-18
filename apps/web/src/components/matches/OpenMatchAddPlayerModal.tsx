'use client'

import { useMemo, useState } from 'react'
import type { Player } from '@fulbito/types'
import Modal from '@/components/Modal'
import SearchInput from '@/components/SearchInput'

type Props = {
  open: boolean
  title: string
  candidates: Player[]
  myPlayerId: string | null
  onClose: () => void
  onPick: (playerId: string) => void
}

export default function OpenMatchAddPlayerModal({ open, title, candidates, myPlayerId, onClose, onPick }: Props) {
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    return needle ? candidates.filter((player) => player.name.toLocaleLowerCase().includes(needle)) : candidates
  }, [candidates, query])

  const close = () => {
    setQuery('')
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title={title}>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar jugador" ariaLabel="Buscar jugador" />
      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600" aria-live="polite">
          {candidates.length === 0 ? 'No quedan jugadores para agregar.' : 'Ningún jugador coincide con la búsqueda.'}
        </p>
      ) : (
        <ul className="mt-3 max-h-80 overflow-y-auto" aria-label="Jugadores disponibles">
          {visible.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  onPick(player.id)
                }}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 text-left text-sm font-semibold text-gray-900 transition hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="truncate">{player.name}</span>
                {player.id === myPlayerId && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">Vos</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
