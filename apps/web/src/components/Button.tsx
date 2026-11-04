'use client'

import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'dangerousSecondary'
  block?: boolean
}

const base =
  'inline-flex justify-center rounded-xl border py-2 px-4 text-sm font-medium shadow-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500'

const variantStyles: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'border-primary-dark bg-primary-gradient text-white hover:bg-primary-gradient-dark hover:border-primary hover:ring-2 hover:ring-primary/30 disabled:bg-none disabled:hover:bg-none disabled:border-transparent disabled:hover:border-transparent disabled:hover:ring-0',
  secondary: 'border-gray-300 bg-white text-black hover:bg-gray-50',
  danger: 'border-transparent bg-orange-700 text-white hover:bg-orange-800',
  dangerousSecondary: 'border-orange-700 bg-white text-orange-700 hover:bg-orange-50',
}

export default function Button({ variant = 'primary', block = false, className = '', ...props }: Props) {
  return (
    <button {...props} className={`${base} ${variantStyles[variant]} ${block ? 'flex-1' : ''} ${className}`.trim()} />
  )
}
