import { Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NewMatchScreen() {
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Text style={styles.title}>/history/new</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { padding: 16, fontSize: 16 },
})
