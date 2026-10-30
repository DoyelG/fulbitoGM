type Props = {
  inactive: boolean
  onChange: (inactive: boolean) => void
}

const options = [
  { inactive: false, label: 'Activo', activeClassName: 'bg-brand text-white' },
  { inactive: true, label: 'Inactivo', activeClassName: 'bg-gray-600 text-white' },
]

export default function StatusToggle({ inactive, onChange }: Props) {
  return (
    <div>
      <span id="player-status-label" className="mb-1 block text-sm font-medium text-gray-900">
        Estado
      </span>
      <div
        role="group"
        aria-labelledby="player-status-label"
        className="inline-flex rounded-lg bg-gray-100 p-1 ring-1 ring-inset ring-gray-200"
      >
        {options.map((option) => {
          const selected = option.inactive === inactive
          return (
            <button
              key={option.label}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.inactive)}
              className={`min-h-9 w-24 rounded-md px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${
                selected ? `${option.activeClassName} shadow-sm` : 'text-gray-700 hover:bg-white'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
