import type { ElementType, ReactNode } from 'react'

type Padding = 0 | 4 | 5 | 6

type Props = {
  children: ReactNode
  as?: ElementType
  padding?: Padding
  className?: string
}

const paddingStyles: Record<Padding, string> = {
  0: '',
  4: 'p-4',
  5: 'p-5',
  6: 'p-6',
}

export function Card({ children, as: Tag = 'div', padding = 4, className = '' }: Props) {
  return (
    <Tag className={`rounded-2xl bg-white shadow-md ${paddingStyles[padding]} ${className}`.trim()}>{children}</Tag>
  )
}
