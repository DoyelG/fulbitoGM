import type { ComponentType } from 'react'
import Link from 'next/link'
import Button from './Button'

export type EmptyStateAction = { label: string; href: string } | { label: string; onClick: () => void }

type EmptyStateProps = {
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  title: string
  description?: string
  action?: EmptyStateAction | null
}

const linkClassName =
  'inline-flex justify-center rounded-md border border-transparent bg-brand py-2 px-4 text-sm font-medium ' +
  'text-white shadow-sm hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2'

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
        <Button type="button" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
