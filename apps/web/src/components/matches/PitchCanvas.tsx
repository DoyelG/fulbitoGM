import type { ReactNode } from 'react'
import MatchPitch, { type MatchPitchProps } from '@/components/home/MatchPitch'

type Props = MatchPitchProps & { hint?: string; footer?: ReactNode; cornerAction?: ReactNode }

export default function PitchCanvas({ hint, footer, cornerAction, ...pitch }: Props) {
  return (
    <div className="space-y-3">
      {hint && <p className="text-sm text-gray-600">{hint}</p>}
      <div className="bg-primary-gradient relative rounded-2xl p-3 sm:p-5">
        <MatchPitch {...pitch} />
        {cornerAction && <div className="absolute top-2 right-2 z-30 sm:top-3 sm:right-3">{cornerAction}</div>}
      </div>
      {footer}
    </div>
  )
}
