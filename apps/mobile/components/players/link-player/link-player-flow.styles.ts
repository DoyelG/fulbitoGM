import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefits: {
    gap: Spacing.sm,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  link: {
    fontWeight: '600',
  },
  button: {
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  error: {
    fontSize: 13,
  },
})
