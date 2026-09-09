import { StyleSheet } from 'react-native'

import { Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
  },
  content: {
    // Clears the tab bar so the last card is fully scrollable into view.
    paddingBottom: 32,
    gap: 12,
  },
  viewSwitch: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  viewTab: {
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
    color: '#ffffff',
  },
  yearSheet: {
    paddingBottom: 8,
  },
  emptyContent: {
    flexGrow: 1,
    paddingBottom: 32,
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
    color: '#ef4444',
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