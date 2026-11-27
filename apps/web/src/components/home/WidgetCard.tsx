import Link from 'next/link'
import type { ReactNode } from 'react'
import type { CardTone } from './card-tone'
import CardTitle from './CardTitle'

export type WidgetCardProps = {
  id: string
  title: string
  emoji?: string
  icon?: ReactNode
  tone: CardTone
  href?: string
  linkLabel?: string
  busy?: boolean
  fill?: boolean
  children: ReactNode
}

export default function WidgetCard({
  id,
  title,
  emoji,
  icon,
  tone,
  href,
  linkLabel,
  busy = false,
  fill = false,
  children,
}: WidgetCardProps) {
  const titleId = `${id}-title`
  return (
    <section
      aria-labelledby={titleId}
      aria-busy={busy}
      className={`h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${fill ? 'flex flex-col' : ''}`}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <CardTitle id={titleId} title={title} emoji={emoji} icon={icon} tone={tone} />
        {href && linkLabel && (
          <Link
            href={href}
            className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {linkLabel}
            <span aria-hidden className="ml-1">
              →
            </span>
          </Link>
        )}
      </header>
      <div aria-live="polite" className={fill ? 'flex flex-1 flex-col' : undefined}>
        {children}
      </div>
    </section>
  )
}
