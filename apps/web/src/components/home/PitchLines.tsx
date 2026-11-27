const STROKE = {
  fill: 'none',
  stroke: 'rgba(255,255,255,0.22)',
  strokeWidth: 2,
  vectorEffect: 'non-scaling-stroke',
} as const

const SVG_CLASS = 'pointer-events-none absolute inset-0 h-full w-full'

function HorizontalLines({ length, className }: { length: number; className: string }) {
  const mid = length / 2
  return (
    <svg aria-hidden viewBox={`0 0 ${length} 400`} preserveAspectRatio="none" className={`${SVG_CLASS} ${className}`}>
      <g {...STROKE}>
        <path d={`M${mid} 0V400`} />
        <circle cx={mid} cy="200" r="78" />
        <rect x="0" y="100" width="96" height="200" />
        <rect x={length - 96} y="100" width="96" height="200" />
        <rect x="0" y="150" width="36" height="100" />
        <rect x={length - 36} y="150" width="36" height="100" />
        <path d="M96 160A40 40 0 0 1 96 240" />
        <path d={`M${length - 96} 160A40 40 0 0 0 ${length - 96} 240`} />
      </g>
    </svg>
  )
}

function VerticalLines({ tall }: { tall: boolean }) {
  const length = tall ? 711 : 600
  const area = length * 0.12
  const smallArea = length * 0.045
  return (
    <svg aria-hidden viewBox={`0 0 400 ${length}`} preserveAspectRatio="none" className={`${SVG_CLASS} sm:hidden`}>
      <g {...STROKE}>
        <path d={`M0 ${length / 2}H400`} />
        <circle cx="200" cy={length / 2} r="78" />
        <rect x="100" y="0" width="200" height={area} />
        <rect x="100" y={length - area} width="200" height={area} />
        <rect x="150" y="0" width="100" height={smallArea} />
        <rect x="150" y={length - smallArea} width="100" height={smallArea} />
        <path d={`M160 ${area}A40 40 0 0 0 240 ${area}`} />
        <path d={`M160 ${length - area}A40 40 0 0 1 240 ${length - area}`} />
      </g>
    </svg>
  )
}

export default function PitchLines({ tall, wide }: { tall: boolean; wide: boolean }) {
  return (
    <>
      <HorizontalLines
        length={wide || !tall ? 800 : 711}
        className={wide ? 'hidden sm:block xl:hidden' : 'hidden sm:block'}
      />
      {wide && <HorizontalLines length={960} className="hidden xl:block" />}
      <VerticalLines tall={tall} />
    </>
  )
}
