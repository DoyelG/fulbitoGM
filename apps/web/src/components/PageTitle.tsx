import type { ReactNode } from 'react'

type Variant = 'default' | 'display'
type Spacing = 0 | 4 | 6 | 8

type Props = {
  children: ReactNode
  actions?: ReactNode
  variant?: Variant
  spacing?: Spacing
  className?: string
}

const variantStyles: Record<Variant, string> = {
  default: 'text-3xl font-bold',
  display: 'text-3xl font-black italic tracking-tight',
}

const spacingStyles: Record<Spacing, string> = {
  0: '',
  4: 'mb-4',
  6: 'mb-6',
  8: 'mb-8',
}

export default function PageTitle({ children, actions, variant = 'default', spacing = 6, className = '' }: Props) {
  const titleClasses = variantStyles[variant]
  const spacingClasses = spacingStyles[spacing]

  if (!actions) return <h1 className={`${titleClasses} ${spacingClasses} ${className}`.trim()}>{children}</h1>

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${spacingClasses} ${className}`.trim()}>
      <h1 className={titleClasses}>{children}</h1>
      {actions}
    </div>
  )
}
