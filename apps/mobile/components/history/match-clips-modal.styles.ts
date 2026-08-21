import { StyleSheet } from 'react-native'
import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.extraBold,
    marginRight: Spacing.sm,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addVideoBtn: {
    borderRadius: Radii.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginBottom: Spacing.md,
  },
  addVideoBtnText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
})
