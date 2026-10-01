'use client'

import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  block?: boolean
}

const base =
  'inline-flex justify-center rounded-md border py-2 px-4 text-sm font-medium shadow-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500'

const variantStyles: Record<NonNullable<Props['variant']>, string> = {
  primary: 'border-transparent bg-brand text-white hover:bg-brand/90',
  secondary: 'border-gray-300 bg-white text-black hover:bg-gray-50',
}

export default function Button({ variant = 'primary', block = false, className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`${base} ${variantStyles[variant]} ${block ? 'flex-1' : ''} ${className}`.trim()}
    />
  )
}