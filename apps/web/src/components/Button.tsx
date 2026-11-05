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
  primary: 'border-transparent bg-brand text-white hover:bg-brand/90 focus-visible:ring-brand',
  secondary: 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-brand',
  tertiary: 'border-brand bg-white text-brand hover:bg-brand/5 focus-visible:ring-brand',
  soft: 'border-brand/30 bg-transparent text-brand hover:bg-brand/10 focus-visible:ring-brand',
  softDanger:
    'border-brand/30 bg-transparent text-brand enabled:hover:bg-red-50 enabled:hover:text-red-600 focus-visible:ring-red-600',
  danger: 'border-transparent bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  dangerousSecondary: 'border-red-600 bg-white text-red-600 hover:bg-red-50 focus-visible:ring-red-600',
  ghost: 'border-transparent bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-brand',
}

const sizeStyles: Record<Size, string> = {
  xs: 'rounded px-2 py-0.5 text-xs font-normal',
  sm: 'rounded-md px-3 py-1 text-sm font-medium',
  md: 'rounded-md px-4 py-2 text-sm font-medium',
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
