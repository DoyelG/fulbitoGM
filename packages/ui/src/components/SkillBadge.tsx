import { Paragraph, XStack } from 'tamagui'

function colorForSkill(skill: number) {
  if (skill <= 5) {
    const t = (Math.max(1, skill) - 1) / 4
    const h = 24
    const s = 85
    const l = 38 + 14 * t
    return `hsl(${h}deg ${s}% ${l}%)`
  }
  const t = (Math.min(10, skill) - 6) / 4
  const h = 270
  const s = 78
  const l = 50 - 14 * t
  return `hsl(${h}deg ${s}% ${l}%)`
}

export function SkillBadge({ skill }: { skill: number | 'unknown' }) {
  if (skill === 'unknown') {
    return (
      <XStack paddingHorizontal={8} paddingVertical={4} borderRadius={6} backgroundColor="$color.border">
        <Paragraph fontSize={12} color="$color.black">
          Unknown
        </Paragraph>
      </XStack>
    )
  }
  const bg = colorForSkill(skill)
  return (
    <XStack paddingHorizontal={8} paddingVertical={4} borderRadius={6} backgroundColor={bg}>
      <Paragraph fontSize={12} color="$color.white">
        Lv {skill}
      </Paragraph>
    </XStack>
  )
}
