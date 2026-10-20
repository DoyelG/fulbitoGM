'use client'

import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses, type ButtonVariant } from './button-styles'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  block?: boolean
}

export default function Button({ variant = 'primary', block = false, className = '', ...props }: Props) {
  return <button {...props} className={buttonClasses(variant, `${block ? 'flex-1' : ''} ${className}`)} />
}
