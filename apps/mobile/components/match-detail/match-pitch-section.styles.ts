import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

const ACTION_SIZE = 44

export const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  hint: {
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  headerText: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.blackItalic,
    fontSize: 13,
    letterSpacing: 0.8,
  },
  status: {
    textAlign: 'right',
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  saveBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 3,
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
    backgroundColor: ContrastColors.onColor,
  },
  cancelBtn: {
    right: Spacing.sm * 2 + ACTION_SIZE,
  },
  saveBtnContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
