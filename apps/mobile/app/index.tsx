import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

const routes = [
  { label: '/login', href: '/login' },
  { label: '/statistics', href: '/(tabs)/statistics' },
  { label: '/players', href: '/(tabs)/players' },
  { label: '/players/new', href: '/(tabs)/players/new' },
  { label: '/players/1 (detalle)', href: '/(tabs)/players/1' },
  { label: '/players/edit/1', href: '/(tabs)/players/edit/1' },
  { label: '/match', href: '/(tabs)/match' },
  { label: '/history', href: '/(tabs)/history' },
];

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>/</Text>
      <Text style={styles.subtitle}>Rutas disponibles</Text>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {routes.map(({ label, href }) => (
          <Link key={label} href={href as any} asChild>
            <TouchableOpacity style={styles.item}>
              <Text style={styles.itemText}>{label}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
  },
  item: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#1d4ed8',
  },
});
