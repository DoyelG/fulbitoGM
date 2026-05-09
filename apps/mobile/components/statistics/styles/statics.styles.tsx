import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  content: {
    paddingBottom: 24,
    gap: 12,
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