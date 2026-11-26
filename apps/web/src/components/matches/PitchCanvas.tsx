import type { ReactNode } from 'react'
import MatchPitch, { type MatchPitchProps } from '@/components/home/MatchPitch'

type Props = MatchPitchProps & { hint?: string; footer?: ReactNode }

export default function PitchCanvas({ hint, footer, ...pitch }: Props) {
  return (
    <div className="space-y-3">
      {hint && <p className="text-sm text-gray-600">{hint}</p>}
      <div className="bg-primary-gradient rounded-2xl p-3 sm:p-5">
        <MatchPitch {...pitch} />
      </div>
      {footer}
    </div>
  )
}
