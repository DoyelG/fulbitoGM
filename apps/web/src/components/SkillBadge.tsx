'use client'

// Skill 1–5: orange (fixed hue ~24), vary intensity from darker → lighter
// Skill 6–10: purple (fixed hue ~270), vary intensity from lighter → darker
function colorForSkill(skill: number) {
  if (skill <= 5) {
    const t = (Math.max(1, skill) - 1) / 4 // 0..1
    const h = 24
    const s = 85 // keep hue stable; saturation fixed
    const l = 38 + 14 * t // 38% → 52% (lighter as skill increases)
    return `hsl(${h}deg ${s}% ${l}%)`
  } else {
    const t = (Math.min(10, skill) - 6) / 4 // 0..1
    const h = 270
    const s = 78 // fixed
    const l = 50 - 14 * t // 50% → 36% (darker as skill increases)
    return `hsl(${h}deg ${s}% ${l}%)`
  }
}

export default function SkillBadge({ skill }: { skill: number | 'unknown' }) {
  if (skill === 'unknown') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-800">Unknown</span>
  }
  const bg = colorForSkill(skill)
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-white" style={{ backgroundColor: bg }}>
      Lv {skill}
    </span>
  )
}