import type { Ref } from 'react'

type Props = {
  label: string
  className?: string
  ref?: Ref<HTMLDivElement>
}

export default function Spinner({ label, className = '', ref }: Props) {
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex items-center gap-2 text-gray-600 ${className}`.trim()}
    >
      <span className="animate-spin text-lg leading-none" aria-hidden="true">
        ⚽
      </span>
      {label}
    </div>
  )
}
