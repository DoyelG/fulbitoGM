import Link from 'next/link'
import type { ReactNode } from 'react'
import { CARD_TONE, type CardTone } from './card-tone'
import CardTitle from './CardTitle'

export type WidgetCardProps = {
  id: string
  title: string
  emoji: string
  tone: CardTone
  href?: string
  linkLabel?: string
  busy?: boolean
  children: ReactNode
}

export default function WidgetCard({
  id,
  title,
  emoji,
  tone,
  href,
  linkLabel,
  busy = false,
  children,
}: WidgetCardProps) {
  const titleId = `${id}-title`
  return (
    <section
      aria-labelledby={titleId}
      aria-busy={busy}
      className={`h-full rounded-2xl border border-t-4 border-gray-200 bg-white p-5 shadow-sm ${CARD_TONE[tone].border}`}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <CardTitle id={titleId} title={title} emoji={emoji} tone={tone} />
        {href && linkLabel && (
          <Link
            href={href}
            className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {linkLabel}
            <span aria-hidden className="ml-1">
              →
            </span>
          </Link>
        )}
      </header>
      <div aria-live="polite">{children}</div>
    </section>
  )
}
