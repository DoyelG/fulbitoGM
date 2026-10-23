import { CARD_TONE_BADGE, type CardTone } from './card-tone'

export type CardTitleProps = { id: string; title: string; emoji: string; tone: CardTone }

export default function CardTitle({ id, title, emoji, tone }: CardTitleProps) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 text-base font-bold text-gray-900">
      <span
        aria-hidden
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-lg ${CARD_TONE_BADGE[tone]}`}
      >
        {emoji}
      </span>
      {title}
    </h2>
  )
}
