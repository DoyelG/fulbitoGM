type Props = {
  count: number
  className?: string
}

export default function UnreadBadge({ count, className = '' }: Props) {
  if (count <= 0) return null
  return (
    <span
      className={`inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-bold leading-5 text-gray-900 ${className}`}
      aria-hidden
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
