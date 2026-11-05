import { Card } from '@/components/Card'
import { StepBadge } from '@/components/StepBadge'
import type { Step } from './matchClient'

const STEPS: { id: Step; title: string }[] = [
  { id: 1, title: 'Jugadores' },
  { id: 2, title: 'Equipos' },
  { id: 3, title: 'Confirmar' },
]

function getStepFill(stepId: number, currentStep: number, progress: number) {
  if (stepId < currentStep) return 1
  if (stepId > currentStep) return 0
  return progress
}

type Props = {
  currentStep: number
  className?: string
  requiredPlayers?: number
  selectedCount?: number
  unassignedManual?: number
  onStepClick: (step: Step) => void
}

export function Stepper({
  currentStep,
  className = '',
  requiredPlayers = 0,
  selectedCount = 0,
  unassignedManual = selectedCount,
  onStepClick,
}: Props) {
  const playersProgress =
    requiredPlayers > 0 ? Math.max(1 - Math.abs(requiredPlayers - selectedCount) / requiredPlayers, 0) : 0
  const teamsProgress =
    selectedCount > 0 ? Math.min(Math.max((selectedCount - unassignedManual) / selectedCount, 0), 1) : 0
  const progressByStep: Record<number, number> = { 1: playersProgress, 2: teamsProgress }

  return (
    <Card as="ol" padding={5} className={`flex items-center ${className}`}>
      {STEPS.map((step, index) => {
        const isReached = step.id <= currentStep
        const isLast = index === STEPS.length - 1
        const fill = getStepFill(step.id, currentStep, progressByStep[step.id] ?? 0)
        const canReturn = step.id < currentStep

        const stepLabel = (
          <>
            <StepBadge step={step.id} active={isReached} />
            <span className={`${isReached ? 'font-semibold text-gray-900' : 'text-gray-400'} hidden sm:inline`}>
              {step.title}
            </span>
          </>
        )

        return (
          <li
            key={step.id}
            aria-current={step.id === currentStep ? 'step' : undefined}
            className={`flex items-center ${isLast ? '' : 'flex-1'}`}
          >
            {canReturn ? (
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                aria-label={`Volver al paso ${step.id}: ${step.title}`}
                className="flex items-center gap-3 rounded-md hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                {stepLabel}
              </button>
            ) : (
              <div className="flex items-center gap-3">{stepLabel}</div>
            )}
            {!isLast && (
              <div aria-hidden="true" className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full bg-brand transition-all duration-400" style={{ width: `${fill * 100}%` }} />
              </div>
            )}
          </li>
        )
      })}
    </Card>
  )
}
