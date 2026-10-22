import Chevron from '../shared/Icons/Chevron'

export type PlayerStatusFilter = 'all' | 'active' | 'inactive'

type Props = {
  value: PlayerStatusFilter
  onChange: (value: PlayerStatusFilter) => void
}

export default function PlayerStatusSelect({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1 min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-2">
      <label htmlFor="player-status-filter" className="text-sm font-medium">
        Filtrar por estado de jugador:
      </label>
      <div className="relative w-full max-w-52 min-[700px]:w-auto">
        <select
          name="player-status-filter"
          id="player-status-filter"
          value={value}
          onChange={(event) => onChange(event.target.value as PlayerStatusFilter)}
          className="h-10 w-full appearance-none rounded-md border border-gray-300 bg-white pl-3 pr-9 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
        >
          <option value="all">Todos los jugadores</option>
          <option value="active">Solo Activos</option>
          <option value="inactive">Solo Inactivos</option>
        </select>
        <Chevron select />
      </div>
    </div>
  )
}
