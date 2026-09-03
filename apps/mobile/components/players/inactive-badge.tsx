import { StyleSheet, Text, View } from 'react-native'

export function InactiveBadge({ inactive }: { inactive?: boolean }) {
  if (!inactive) return null
  return (
    <View style={styles.badge} accessibilityLabel="Jugador inactivo">
      <Text style={styles.text}>Inactivo</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  text: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
