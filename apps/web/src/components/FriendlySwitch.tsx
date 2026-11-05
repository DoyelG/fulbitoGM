'use client'

type Props = {
  isFriendly: boolean
  onToggle: () => void
  id?: string
  labelClassName?: string
}

export default function FriendlySwitch({
  isFriendly,
  onToggle,
  id = 'friendly-match',
  labelClassName = 'block text-sm mb-1',
}: Props) {
  const knobPosition = isFriendly ? 'translate-x-[76px]' : 'translate-x-0'

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        Tipo de partido
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isFriendly}
        aria-label="Partido amistoso"
        onClick={onToggle}
        className={`relative inline-flex h-10 w-28 shrink-0 items-center overflow-hidden rounded-full p-1 transition-colors duration-300 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
          isFriendly ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-scoreboard'
        }`}
      >
        <span
          className={`absolute left-9 whitespace-nowrap text-xs font-semibold text-white transition-transform duration-[600ms] ease-in-out ${knobPosition}`}
        >
          Competitivo
        </span>
        <span
          className={`absolute -left-[60px] whitespace-nowrap text-xs font-semibold text-white transition-transform duration-[600ms] ease-in-out ${knobPosition}`}
        >
          Amistoso
        </span>
        <span
          className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-[600ms] ease-in-out ${knobPosition}`}
        >
          <span aria-hidden="true">{isFriendly ? '🤝' : '⚔️'}</span>
        </span>
      </button>
    </div>
  )
}
