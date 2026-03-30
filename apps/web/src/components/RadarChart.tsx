'use client'

type Props = {
  labels: string[]
  values: number[]
  maxValue?: number
  ringCount?: number
  baseline?: number
  width?: number
  height?: number
  className?: string
  labelSize?: number
  margin?: number
}

export default function RadarChart({
  labels,
  values,
  maxValue = 10,
  ringCount = 4,
  baseline,
  width = 200,
  height = 200,
  className,
  labelSize = 11,
  margin = 36
}: Props) {
  const N = labels.length
  const w = width
  const h = height
  const cx = w / 2
  const cy = h / 2 + 4
  const radius = Math.min(w, h) / 2 - margin

  const angleFor = (i: number) => (-Math.PI / 2) + (i * (2 * Math.PI / N))
  const clamped = (v: number) => Math.max(0, Math.min(maxValue, v))

  const point = (i: number, val: number) => {
    const t = clamped(val) / maxValue
    const r = radius * t
    const a = angleFor(i)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }

  const polygonPath = (vals: number[]) => {
    if (!vals.length) return ''
    const pts = vals.map((v, i) => point(i, v))
    const [x0, y0] = pts[0]
    return `M ${x0} ${y0} ` + pts.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ') + ' Z'
  }

  const gridRings = Array.from({ length: ringCount }, (_, i) => (i + 1) / ringCount)

  const brand = 'hsl(270deg 78% 42%)'
  const accent = 'hsl(24deg 85% 48%)'
  const grid = '#E5E7EB'
  const axis = '#CBD5E1'
  const labelColor = '#111827'

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label="Skill radar">
        {gridRings.map((t, idx) => (
          <circle key={idx} cx={cx} cy={cy} r={radius * t} fill="none" stroke={grid} strokeWidth={0.75} />
        ))}
        {labels.map((_, i) => {
          const [x, y] = point(i, maxValue)
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={axis} strokeWidth={0.75} />
        })}
        {typeof baseline === 'number' && (
          <path d={polygonPath(Array(N).fill(baseline))} fill={accent} opacity={0.12} stroke={accent} strokeWidth={1} />
        )}
        <path d={polygonPath(values)} fill={brand} opacity={0.18} stroke={brand} strokeWidth={2} />
        {values.map((v, i) => {
          const [x, y] = point(i, v)
          return <circle key={i} cx={x} cy={y} r={2.5} fill={brand} />
        })}
        {labels.map((label, i) => {
          const [lx, ly] = point(i, maxValue + 0.6)
          const align = lx > cx + 4 ? 'start' : lx < cx - 4 ? 'end' : 'middle'
          const dy = ly < cy - 4 ? -2 : ly > cy + 4 ? 12 : 6
          return (
            <text key={i} x={lx} y={ly} textAnchor={align} fontSize={labelSize} fill={labelColor} dy={dy}>
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}