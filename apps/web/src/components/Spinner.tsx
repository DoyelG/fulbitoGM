type Props = {
  label: string
  className?: string
}

export default function Spinner({ label, className = '' }: Props) {
  return (
    <div
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
