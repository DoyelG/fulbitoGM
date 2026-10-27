type GradientHeaderProps = {
  leading: React.ReactNode
  title: string
  subtitle: string
  stackedOnMobile?: boolean
  children?: React.ReactNode
}

export default function GradientHeader({
  leading,
  title,
  subtitle,
  stackedOnMobile = false,
  children,
}: GradientHeaderProps) {
  return (
    <header className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-brand p-6 text-white shadow-lg sm:p-8">
      <span aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-12 right-24 h-28 w-28 rounded-full bg-accent/30" />
      <div
        className={`relative flex items-center gap-4 ${stackedOnMobile ? 'flex-col text-center sm:flex-row sm:text-left' : ''}`}
      >
        {leading}
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-bold">{title}</h1>
          <p aria-live="polite" className="truncate text-sm text-white/90">
            {subtitle}
          </p>
          {children}
        </div>
      </div>
    </header>
  )
}
