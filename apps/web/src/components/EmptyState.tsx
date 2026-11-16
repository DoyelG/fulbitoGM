import type { ComponentType } from 'react'
import Link from 'next/link'
import Button from './Button'

export type EmptyStateAction = { label: string; href: string } | { label: string; onClick: () => void }

export type EmptyStateProps = {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  description?: string
  action?: EmptyStateAction | null
}

const linkClassName =
  'mt-3 px-4 py-2 text-sm font-medium inline-flex justify-center rounded-xl border border-primary-dark bg-primary-gradient ' +
  'text-white shadow-sm hover:bg-primary-gradient-dark hover:border-primary hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <Icon className="h-12 w-12 text-gray-500" aria-hidden />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-gray-800">{description}</p>}
      {action && 'href' in action && (
        <Link href={action.href} className={linkClassName}>
          {action.label}
        </Link>
      )}
      {action && 'onClick' in action && (
        <Button type="button" className="mt-3" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
