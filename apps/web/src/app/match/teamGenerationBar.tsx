'use client'

import Button from '@/components/Button'

type Props = {
  onManual: () => void
  onAuto: () => void
}

export default function TeamGenerationBar({ onManual, onAuto }: Props) {
  return (
    <div
      role="region"
      aria-label="Generar equipos"
      className="pointer-events-none sticky bottom-6 z-20 mt-6 flex justify-end motion-safe:transition-all motion-safe:duration-500 starting:translate-y-8 starting:opacity-0"
    >
      <div className="pointer-events-auto flex w-full flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-gray-200 sm:w-auto sm:flex-row">
        <Button variant="tertiary" onClick={onManual}>
          Generación manual
        </Button>
        <Button onClick={onAuto}>Generación automática</Button>
      </div>
    </div>
  )
}
