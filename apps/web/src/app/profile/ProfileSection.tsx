import type { IconType } from 'react-icons'

type ProfileSectionProps = {
  icon: IconType
  title: string
  index: number
  children: React.ReactNode
}

export default function ProfileSection({ icon: Icon, title, index, children }: ProfileSectionProps) {
  return (
    <section
      style={{ animationDelay: `${index * 80}ms` }}
      className="animate-fade-up rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold text-gray-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon aria-hidden />
        </span>
        {title}
      </h2>
      {children}
    </section>
  )
}
