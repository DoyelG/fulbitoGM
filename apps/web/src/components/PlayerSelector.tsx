'use client'

import { useId, useState, type ReactNode } from 'react'
import type { Player } from '@fulbito/types'
import EmptyState from './EmptyState'
import { FiUsers } from 'react-icons/fi'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'

type PlayerSelectorProps = {
    players: Player[]
    selectedIds: ReadonlySet<string>
    onChange: (selectedIds: Set<string>) => void
    hidePlayerCondition?: (player: Player) => boolean
    isMultiSelector?: boolean
    renderSelectedPlayerAction?: (player: Player) => ReactNode
    playerBackgroundClassName?: string
    maxHeight?: number | string
}

export default function PlayerSelector({
    players,
    selectedIds,
    onChange,
    hidePlayerCondition,
    isMultiSelector = true,
    renderSelectedPlayerAction,
    playerBackgroundClassName = 'bg-gray-50',
    maxHeight,
}: PlayerSelectorProps) {
    const groupName = useId()
    const [playerQuery, setPlayerQuery] = useState('')

    const { isAdmin } = useFirebaseAuth()

    const selectPlayer = (playerId: string) => {
        if (!isMultiSelector) {
            onChange(new Set([playerId]))
            return
        }
        const nextSelectedIds = new Set(selectedIds)
        if (nextSelectedIds.has(playerId)) nextSelectedIds.delete(playerId)
        else nextSelectedIds.add(playerId)
        onChange(nextSelectedIds)
    }

    const normalizedQuery = playerQuery.trim().toLowerCase()
    const visiblePlayers = players.filter(
        (player) => !hidePlayerCondition?.(player) && player.name.toLowerCase().includes(normalizedQuery),
    )

    return (
        <div>
            <div className="mb-3">
                <input
                    type="text"
                    value={playerQuery}
                    onChange={(e) => setPlayerQuery(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Buscar jugadores por nombre..."
                    aria-label="Buscar jugadores por nombre"
                />
            </div>
            <div
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ${maxHeight === undefined ? '' : 'scrollbar-visible pr-2'}`}
                style={maxHeight === undefined ? undefined : { maxHeight }}
            >
                {visiblePlayers.map((player) => {
                    const isSelected = selectedIds.has(player.id)
                    return (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between gap-2 rounded px-3 py-2 ${playerBackgroundClassName}`}
                        >
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                <input
                                    type={isMultiSelector ? 'checkbox' : 'radio'}
                                    name={groupName}
                                    checked={isSelected}
                                    onChange={() => selectPlayer(player.id)}
                                />
                                <span className="font-medium truncate">{player.name}</span>
                            </label>
                            {isSelected && renderSelectedPlayerAction?.(player)}
                        </div>
                    )
                })}
            </div>
            {visiblePlayers.length === 0 && (
                <EmptyState
                    icon={FiUsers}
                    title="No hay jugadores disponibles para seleccionar"
                    description={isAdmin ? "Agregá jugadores para armar los equipos." : "Contactate con un administrador para que cree nuevos jugadores."}
                    action={isAdmin ? { label: 'Ir a jugadores', href: '/players' } : undefined}
                />
            )}
        </div>
    )
}
