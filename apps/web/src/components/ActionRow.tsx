'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { type ReactNode, type MouseEvent } from 'react'
import Tooltip from '@/components/Tooltip'

export type RowAction = {
  icon: ReactNode
  variant: 'primary' | 'danger'
  href?: string
  onClick?: () => void
  tooltip?: string
}

type Props = {
  actions: RowAction[]
  children: ReactNode
  className?: string
  tooltipPosition?: 'top' | 'bottom'
}

const variantStyles: Record<RowAction['variant'], string> = {
  primary: 'text-gray-500 hover:text-brand hover:bg-brand/10',
  danger: 'text-gray-500 hover:text-red-600 hover:bg-red-50',
}

export default function ActionRow({ actions, children, className = '', tooltipPosition = 'bottom' }: Props) {
  const router = useRouter()
  const singleAction = actions.length === 1 ? actions[0] : null

  const handleRowClick = (e: MouseEvent<HTMLTableRowElement>) => {
    if (!singleAction) return
    if ((e.target as HTMLElement).closest('a, button')) return
    if (singleAction.href) router.push(singleAction.href)
    else singleAction.onClick?.()
  }

  if (singleAction || actions.length === 0) {
    return (
      <tr
        className={`hover:bg-gray-50 ${singleAction?.href ? 'cursor-pointer' : ''} ${className}`}
        onClick={singleAction ? handleRowClick : undefined}
      >
        {children}
      </tr>
    )
  }

  return (
    <tr className={`hover:bg-gray-50 ${className}`}>
      {children}
      <td className="px-4 py-3">
        <div className="flex justify-end items-center gap-1">
          {actions.map((action, i) => {
            const cls = `p-1.5 rounded-md transition-colors ${variantStyles[action.variant]}`
            const element = action.href ? (
              <Link key={i} href={action.href} className={cls}>{action.icon}</Link>
            ) : (
              <button key={i} onClick={action.onClick} className={cls}>{action.icon}</button>
            )
            return action.tooltip ? (
              <Tooltip key={i} label={action.tooltip} position={tooltipPosition} variant={action.variant}>{element}</Tooltip>
            ) : element
          })}
        </div>
      </td>
    </tr>
  )
}
