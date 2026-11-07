import { StyleSheet } from 'react-native'

import { Colors, ContrastColors, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  separator: {
    height: 12,
  },
  safe: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
  },
  content: {
    paddingBottom: 32,
    gap: 12,
  },
  viewSwitch: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 12,
  },
  viewTab: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  viewTabText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  yearBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  yearBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: ContrastColors.onColor,
  },
  yearSheet: {
    paddingBottom: 8,
  },
  emptyContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
  },
  stateText: {
    textAlign: 'center',
    marginTop: 28,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 22,
    textAlign: 'center',
    color: Colors.light.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  retryText: {
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
})
