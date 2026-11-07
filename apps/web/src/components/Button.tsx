'use client'

import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'soft' | 'softDanger' | 'danger' | 'dangerousSecondary' | 'ghost'
type Size = 'xs' | 'sm' | 'md'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  block?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 border transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const variantStyles: Record<Variant, string> = {
  primary:
    'border-primary-dark bg-primary-gradient text-white enabled:hover:bg-primary-gradient-dark enabled:hover:border-primary enabled:hover:ring-2 enabled:hover:ring-primary/30 focus-visible:ring-primary',
  secondary: 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-primary',
  tertiary: 'border-primary bg-white text-primary hover:bg-primary/5 focus-visible:ring-primary',
  soft: 'border-primary/30 bg-transparent text-primary hover:bg-primary/10 focus-visible:ring-primary',
  softDanger:
    'border-primary/30 bg-transparent text-primary enabled:hover:bg-orange-50 enabled:hover:text-orange-700 focus-visible:ring-orange-700',
  danger: 'border-transparent bg-orange-700 text-white hover:bg-orange-800 focus-visible:ring-orange-700',
  dangerousSecondary: 'border-orange-700 bg-white text-orange-700 hover:bg-orange-50 focus-visible:ring-orange-700',
  ghost: 'border-transparent bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-primary',
}

const sizeStyles: Record<Size, string> = {
  xs: 'rounded px-2 py-0.5 text-xs font-normal',
  sm: 'rounded-xl px-3 py-1 text-sm font-medium',
  md: 'rounded-xl px-4 py-2 text-sm font-medium',
}

const raisedVariants: Variant[] = ['primary', 'secondary', 'tertiary', 'danger']

type ButtonStyleOptions = Pick<ButtonProps, 'variant' | 'size' | 'block' | 'className'>

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
}: ButtonStyleOptions = {}) {
  const shadow = size !== 'xs' && raisedVariants.includes(variant) ? 'shadow-sm' : ''
  return `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${shadow} ${block ? 'flex-1' : ''} ${className}`.trim()
}

export default function Button({ variant, size, block, type = 'button', className, ...props }: ButtonProps) {
  return <button type={type} {...props} className={buttonClasses({ variant, size, block, className })} />
}
