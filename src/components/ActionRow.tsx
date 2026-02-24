'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { type ReactNode, type ReactElement, type MouseEvent } from 'react'
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

  const childArray = React.Children.toArray(children)
  const lastChild = childArray[childArray.length - 1]
  const restChildren = childArray.slice(0, -1)

  const overlay = (
    <div className="absolute inset-0 flex items-center justify-end pr-3 gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent pointer-events-none">
      {actions.map((action, i) => {
        const cls = `pointer-events-auto p-1.5 rounded-md transition-colors ${variantStyles[action.variant]}`
        const element = action.href ? (
          <Link key={i} href={action.href} className={cls}>{action.icon}</Link>
        ) : (
          <button key={i} onClick={action.onClick} className={cls}>{action.icon}</button>
        )
        return action.tooltip ? (
          <Tooltip key={i} label={action.tooltip} position={tooltipPosition}>{element}</Tooltip>
        ) : element
      })}
    </div>
  )

  const enhancedLast = (() => {
    if (!React.isValidElement(lastChild)) return lastChild
    const el = lastChild as ReactElement<{ className?: string; children?: ReactNode }>
    return React.cloneElement(
      el,
      { className: `${el.props.className || ''} relative`.trim() },
      <>{el.props.children}{overlay}</>
    )
  })()

  return (
    <tr className={`group hover:bg-gray-50 ${className}`}>
      {restChildren}
      {enhancedLast}
    </tr>
  )
}
