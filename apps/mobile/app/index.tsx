import { Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

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
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>/</Text>
      {user ? (
        <View style={styles.sessionRow}>
          <Text style={styles.sessionText}>
            Sesión: {user.name} ({user.role})
          </Text>
          <Pressable
            onPress={async () => {
              await signOut();
            }}
            style={styles.signOutBtn}
          >
            <Text style={styles.signOutText}>Salir</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => router.push('/login')} style={styles.loginCta}>
          <Text style={styles.loginCtaText}>Iniciar sesión</Text>
        </Pressable>
      )}
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
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  sessionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  signOutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  signOutText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 14,
  },
  loginCta: {
    alignSelf: 'flex-start',
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  loginCtaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
