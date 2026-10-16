'use client'

function colorForSkill(skill: number) {
  if (skill <= 5) {
    const intensity = (Math.max(1, skill) - 1) / 4
    const h = 24
    const s = 85
    const l = 38 + 14 * intensity
    return `hsl(${h}deg ${s}% ${l}%)`
  } else {
    const intensity = (Math.min(10, skill) - 6) / 4
    const h = 270
    const s = 78
    const l = 50 - 14 * intensity
    return `hsl(${h}deg ${s}% ${l}%)`
  }
}

export default function SkillBadge({ skill, muted = false }: { skill: number | 'unknown'; muted?: boolean }) {
  if (skill === 'unknown') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">Unknown</span>
  }
  if (muted) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-500">
        Lv {skill}
      </span>
    )
  }
  const bg = colorForSkill(skill)
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: bg }}>
      Lv {skill}
    </span>
  )
}