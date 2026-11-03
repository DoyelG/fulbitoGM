import { StyleSheet } from 'react-native'

import { Colors } from '@/constants/theme'

export const styles = StyleSheet.create({
  wrap: {
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    backgroundColor: Colors.light.secondary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.secondary,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
})
