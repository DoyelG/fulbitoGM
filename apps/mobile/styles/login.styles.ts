import { Platform, StyleSheet } from 'react-native'

import { Colors, ContrastColors, PrimaryColors } from '@/constants/theme'

const PRIMARY = PrimaryColors.border

export const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  segment: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.chipBorder,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.light.chipBg,
  },
  segmentBtnActive: {
    backgroundColor: PRIMARY,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  segmentTextActive: {
    color: ContrastColors.onColor,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: 16,
  },
  error: {
    color: Colors.light.danger,
    fontSize: 14,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: {
    color: ContrastColors.onColor,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  link: {
    marginTop: 24,
    alignSelf: 'center',
    padding: 8,
  },
  linkText: {
    fontSize: 14,
  },
})
