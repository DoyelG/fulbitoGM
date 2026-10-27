import type { IconType } from 'react-icons'

type LinkPlayerHeroProps = {
  icon: IconType
  title: string
  description: string
  tone?: 'brand' | 'success' | 'danger'
}

const TONE_STYLES = {
  brand: 'bg-scoreboard text-white',
  success: 'bg-green-600 text-white',
  danger: 'bg-red-600 text-white',
}

export default function LinkPlayerHero({ icon: Icon, title, description, tone = 'brand' }: LinkPlayerHeroProps) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl ${TONE_STYLES[tone]}`}
      >
        <Icon size={36} aria-hidden />
      </div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-700">{description}</p>
    </div>
  )
}
