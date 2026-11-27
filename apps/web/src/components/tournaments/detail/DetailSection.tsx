import type { ComponentType, ReactNode } from 'react'
import Link from 'next/link'

type Props = {
  id: string
  title: string
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  action?: { label: string; href: string } | ReactNode
  description?: string
  className?: string
  headerClassName?: string
  children: ReactNode
}

function isLinkAction(action: Props['action']): action is { label: string; href: string } {
  return typeof action === 'object' && action !== null && 'href' in action && 'label' in action
}

export default function DetailSection({
  id,
  title,
  icon: Icon,
  action,
  description,
  className = '',
  headerClassName = '',
  children,
}: Props) {
  const heading = (
    <h2 id={id} className="flex items-center gap-2 text-lg font-semibold text-gray-900">
      <Icon className="h-5 w-5 text-primary" aria-hidden />
      {title}
    </h2>
  )
  return (
    <section aria-labelledby={id} className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <div
        className={`mb-4 flex justify-between gap-3 ${description ? 'items-start' : 'items-center'} ${headerClassName}`}
      >
        {description ? (
          <div className="min-w-0">
            {heading}
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
        ) : (
          heading
        )}
        {isLinkAction(action) ? (
          <Link
            href={action.href}
            className="rounded text-sm font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {action.label}
          </Link>
        ) : (
          action
        )}
      </div>
      {children}
    </section>
  )
}
