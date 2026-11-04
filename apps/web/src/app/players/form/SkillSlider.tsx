import { colorForGoalkeeperSkill, colorForSkill } from '@/components/SkillBadge'

type Props = {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  hint?: string
  isGoalkeeper?: boolean
}

export default function SkillSlider({ id, label, value, onChange, hint, isGoalkeeper = false }: Props) {
  const color = isGoalkeeper ? colorForGoalkeeperSkill(value) : colorForSkill(value)
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        <span
          aria-hidden
          className="min-w-12 rounded-md px-2 py-0.5 text-center text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Lv {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={`Nivel ${value} de 10`}
        aria-describedby={hintId}
        className="mt-2 h-2 w-full cursor-pointer accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      />
      <div aria-hidden className="mt-1 flex justify-between text-[11px] text-gray-600">
        <span>1</span>
        <span>10</span>
      </div>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-gray-700">
          {hint}
        </p>
      )}
    </div>
  )
}
