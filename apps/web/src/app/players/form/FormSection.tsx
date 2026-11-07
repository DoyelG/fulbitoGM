import type { ReactNode } from 'react'

type Props = {
  id: string
  title: string
  description?: string
  children: ReactNode
}

export default function FormSection({ id, title, description, children }: Props) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 id={id} className="text-base font-semibold text-gray-900">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-gray-700">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}
