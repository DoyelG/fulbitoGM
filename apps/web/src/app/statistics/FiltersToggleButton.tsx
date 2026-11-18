import { AdjustmentsHorizontalIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import Button from '@/components/Button'

type Props = {
  open: boolean
  activeCount: number
  controlsId: string
  onClick: () => void
}

export default function FiltersToggleButton({ open, activeCount, controlsId, onClick }: Props) {
  return (
    <Button variant="secondary" aria-expanded={open} aria-controls={controlsId} onClick={onClick}>
      <AdjustmentsHorizontalIcon className="size-4 text-gray-500" aria-hidden="true" />
      Filtros
      {activeCount > 0 && (
        <span className="inline-flex min-w-5 justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
          <span className="sr-only">activos: </span>
          {activeCount}
        </span>
      )}
      <ChevronDownIcon
        className={`size-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </Button>
  )
}
