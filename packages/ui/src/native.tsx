import { StyleSheet, Text, View } from 'react-native'

import type { SharedBadgeProps, SharedBadgeTone } from './sharedBadge.types'

const toneStyles: Record<SharedBadgeTone, { container: object; title: object }> = {
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
    <View style={[styles.container, currentTone.container]}>
      <Text style={[styles.title, currentTone.title]}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: '#374151',
  },
})
