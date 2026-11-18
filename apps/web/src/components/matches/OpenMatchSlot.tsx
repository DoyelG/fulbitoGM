'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'

type Props = {
  position: number
  name: string | null
  isMe: boolean
  onSelect: (() => void) | null
  selectLabel: string
  onRemove: (() => void) | null
  disabled: boolean
}

export default function OpenMatchSlot({ position, name, isMe, onSelect, selectLabel, onRemove, disabled }: Props) {
  const number = (
    <span aria-hidden className="w-6 shrink-0 text-right text-xs font-bold text-gray-500 tabular-nums">
      {position}
    </span>
  )

  if (name === null) {
    if (onSelect) {
      return (
        <li>
          <button
            type="button"
            onClick={onSelect}
            disabled={disabled}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-dashed border-primary/40 px-3 text-left text-sm font-semibold text-primary transition enabled:hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
          >
            {number}
            <span>
              Lugar libre · {selectLabel}
              <span className="sr-only"> en el lugar {position}</span>
            </span>
          </button>
        </li>
      )
    }
    return (
      <li className="flex min-h-11 items-center gap-3 rounded-lg border border-dashed border-gray-300 px-3 text-sm text-gray-600">
        {number}
        <span>
          Lugar libre<span className="sr-only"> {position}</span>
        </span>
      </li>
    )
  }

  return (
    <li
      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold ${isMe ? 'bg-primary/10 text-primary-dark ring-1 ring-primary/30' : 'bg-gray-50 text-gray-900'}`}
    >
      {number}
      <span className="min-w-0 flex-1 truncate">{name}</span>
      {isMe && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">Vos</span>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Quitar a ${name} de la lista`}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-600 transition enabled:hover:bg-orange-50 enabled:hover:text-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 disabled:opacity-50"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden />
        </button>
      )}
    </li>
  )
}
