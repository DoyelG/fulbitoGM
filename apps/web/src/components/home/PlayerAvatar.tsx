import Image from 'next/image'

export type PlayerAvatarProps = {
  name: string
  photoUrl?: string | null
  size?: 'sm' | 'base' | 'md' | 'lg'
  onDark?: boolean
}

const SIZES = {
  sm: { px: 28, className: 'h-7 w-7 text-[11px]' },
  base: { px: 36, className: 'h-9 w-9 text-xs' },
  md: { px: 44, className: 'h-11 w-11 text-sm' },
  lg: { px: 72, className: 'h-18 w-18 text-xl' },
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

export default function PlayerAvatar({ name, photoUrl, size = 'sm', onDark = false }: PlayerAvatarProps) {
  const { px, className } = SIZES[size]
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt=""
        width={px}
        height={px}
        className={`${className} shrink-0 rounded-full object-cover ring-1 ring-gray-200`}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={`${className} grid shrink-0 place-items-center rounded-full font-bold text-brand ${onDark ? 'bg-white' : 'bg-brand/10'}`}
    >
      {initials(name)}
    </span>
  )
}
