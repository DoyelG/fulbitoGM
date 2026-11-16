'use client'

type StepBadgeProps = {
  step: number
  active?: boolean
}

export function StepBadge({ step, active = false }: StepBadgeProps) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-lg font-semibold ${
        active ? 'border-primary text-primary' : 'border-gray-300 text-gray-400'
      }`}
    >
      {step}
    </span>
  )
}
