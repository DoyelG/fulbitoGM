'use client'

import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
type Size = 'sm' | 'md'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  block?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const variantStyles: Record<Variant, string> = {
  primary: 'border-transparent bg-brand text-white shadow-sm hover:bg-brand/90 focus-visible:ring-brand',
  secondary: 'border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:ring-brand',
  tertiary: 'border-brand bg-white text-brand shadow-sm hover:bg-brand/5 focus-visible:ring-brand',
  danger: 'border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-600',
  ghost: 'border-transparent bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-brand',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
}

type ButtonStyleOptions = Pick<ButtonProps, 'variant' | 'size' | 'block' | 'className'>

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
}: ButtonStyleOptions = {}) {
  return `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${block ? 'flex-1' : ''} ${className}`.trim()
}

export default function Button({ variant, size, block, type = 'button', className, ...props }: ButtonProps) {
  return <button type={type} {...props} className={buttonClasses({ variant, size, block, className })} />
}
