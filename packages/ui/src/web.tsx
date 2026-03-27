import type { CSSProperties } from 'react'

import type { SharedBadgeProps, SharedBadgeTone } from './sharedBadge.types'

const toneStyles: Record<SharedBadgeTone, { container: CSSProperties; title: CSSProperties }> = {
  neutral: {
    container: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' },
    title: { color: '#3730a3' },
  },
  success: {
    container: { backgroundColor: '#ecfdf3', borderColor: '#bbf7d0' },
    title: { color: '#166534' },
  },
  warning: {
    container: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
    title: { color: '#92400e' },
  },
}

export function SharedBadge({ title, description, tone = 'neutral' }: SharedBadgeProps) {
  const currentTone = toneStyles[tone]

  return (
    <div
      style={{
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        ...currentTone.container,
      }}
    >
      <strong style={{ fontSize: 14, ...currentTone.title }}>{title}</strong>
      <span style={{ fontSize: 13, color: '#374151' }}>{description}</span>
    </div>
  )
}
