import { FiChevronDown } from 'react-icons/fi'

type Direction = 'down' | 'up' | 'left' | 'right'

const ROTATION: Record<Direction, string> = {
  down: '',
  up: 'rotate-180',
  left: 'rotate-90',
  right: '-rotate-90',
}

const SELECT_CLASS = 'pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500'

type Props = {
  direction?: Direction
  select?: boolean
  className?: string
}

export default function Chevron({ direction = 'down', select = false, className = '' }: Props) {
  return (
    <FiChevronDown
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-200 ${ROTATION[direction]} ${select ? SELECT_CLASS : ''} ${className}`}
    />
  )
}
