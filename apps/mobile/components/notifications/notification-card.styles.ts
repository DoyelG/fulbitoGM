import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  accentBar: {
    width: 6,
  },
  content: {
    flex: 1,
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.pill,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
  },
  email: {
    fontSize: 15,
    fontWeight: '700',
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.pill,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
})
