'use client'

import { useId, useState } from 'react'
import type { Player } from '@fulbito/types'

type PlayerSelectorProps = {
    players: Player[]
    hidePlayerCondition?: (player: Player) => boolean
    isMultiSelector?: boolean
    onSelectionChange?: (selectedIds: string[]) => void
    inputBackgroundColor?: string
}

export default function PlayerSelector({
    players,
    hidePlayerCondition,
    isMultiSelector = true,
    onSelectionChange,
    inputBackgroundColor = "bg-gray-50"
}: PlayerSelectorProps) {
    const groupName = useId()
    const [playerQuery, setPlayerQuery] = useState('')
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const toggleSelect = (id: string) => {
        let nextSelectedIds = [id]
        if (isMultiSelector) {
            nextSelectedIds = selectedIds.includes(id)
                ? selectedIds.filter((selectedId) => selectedId !== id)
                : [...selectedIds, id]
        }
        setSelectedIds(nextSelectedIds)
        onSelectionChange?.(nextSelectedIds)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
                {visiblePlayers.map((player) => (
                    <label
                        key={player.id}
                        className={`flex items-center gap-2 cursor-pointer min-w-0 ${inputBackgroundColor} rounded px-3 py-2`}
                    >
                        <input
                            type={isMultiSelector ? 'checkbox' : 'radio'}
                            name={groupName}
                            checked={selectedIds.includes(player.id)}
                            onChange={() => toggleSelect(player.id)}
                        />
                        <span className="font-medium truncate">{player.name}</span>
                    </label>
                ))}
            </div>
            {visiblePlayers.length === 0 && (
                <p className="text-sm text-gray-800" aria-live="polite">
                    No se encontraron jugadores
                </p>
            )}
        </div>
    )
}
