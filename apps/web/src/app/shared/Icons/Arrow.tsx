import { FiArrowDown } from 'react-icons/fi'

type Direction = 'down' | 'up'

const ROTATION: Record<Direction, string> = {
  down: '',
  up: 'rotate-180',
}

type Props = {
  direction?: Direction
  className?: string
}

export default function Arrow({ direction = 'down', className = '' }: Props) {
  return (
    <FiArrowDown
      aria-hidden="true"
      strokeWidth={3}
      className={`h-4 w-3 transition-transform duration-200 ${ROTATION[direction]} ${className}`}
    />
  )
}
