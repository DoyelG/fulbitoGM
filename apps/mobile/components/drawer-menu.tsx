import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const MENU_ITEMS: { id: string; label: string; icon: IoniconName; href: string }[] = [
  { id: 'statistics', label: 'Estadísticas', icon: 'stats-chart', href: '/(tabs)/statistics' },
  { id: 'players', label: 'Jugadores', icon: 'people', href: '/(tabs)/players' },
  { id: 'match', label: 'Nuevo Partido', icon: 'football', href: '/(tabs)/match' },
  { id: 'history', label: 'Historial', icon: 'time', href: '/(tabs)/history' },
];

function MenuItem({
  item,
  index,
  progress,
  active,
  onPress,
}: {
  item: (typeof MENU_ITEMS)[number];
  index: number;
  progress: SharedValue<number>;
  active: boolean;
  onPress: () => void;
}) {
  const animStyle = useAnimatedStyle(() => {
    const staggered = Math.max(0, progress.value - index * 0.12);
    return {
      opacity: interpolate(staggered, [0, 1], [0, 1]),
      transform: [{ translateX: interpolate(staggered, [0, 1], [-24, 0]) }],
    };
  });

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.itemPressed]}
      >
        <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
          <Ionicons name={item.icon} size={20} color={active ? '#FFFFFF' : '#A78BFA'} />
        </View>
        <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>
        <Ionicons name="chevron-forward" size={15} color={active ? '#A78BFA' : '#4B5563'} />
      </Pressable>
    </Animated.View>
  );
}

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SharedValue<number>;
  user: { name: string; email: string; image: string | null } | null;
}

export function DrawerMenu({ isOpen, onClose, progress, user }: DrawerMenuProps) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.78, 320);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [-60, 0]) },
    ],
  }));

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.root]}
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          drawerStyle,
          { width: drawerWidth, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View
          style={styles.drawerHeader}
        >
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color="white" />
          </Pressable>
        </View>

        {user ? (
          <View style={styles.userSection}>
            <Image
              source={user.image ? { uri: user.image } : require('@/assets/images/user-placeholder.png')}
              style={styles.userAvatar}
            />
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.loginSection}>
            <Text style={styles.loginTitle}>¡Bienvenido!</Text>
            <Text style={styles.loginSubtitle}>Ingresá para ver tu perfil y estadísticas</Text>
            <Pressable onPress={() => router.push('/login')} style={styles.loginBtnHitArea}>
              {({ pressed }) => {
                const bg = pressed ? '#6D28D9' : '#7C3AED';
                return (
                  <View style={styles.loginBtnRow}>
                    <View style={[styles.loginBtnLeft, { borderRightColor: bg }]} />
                    <View style={[styles.loginBtnMid, { backgroundColor: bg }]}>
                      <Text style={styles.loginBtnText}>+ INGRESAR</Text>
                    </View>
                    <View style={[styles.loginBtnRight, { borderLeftColor: bg }]} />
                  </View>
                );
              }}
            </Pressable>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <MenuItem
              key={item.id}
              item={item}
              index={i}
              progress={progress}
              active={pathname.startsWith(item.href.replace('(tabs)/', ''))}
              onPress={() => {
                onClose();
                router.push(item.href as never);
              }}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerHeader: {
    alignItems: 'flex-end',
    marginHorizontal: 16,
  },

  menu: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginVertical: 2,
    gap: 14,
  },
  itemPressed: {
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
  },
  itemActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.25)',
    borderLeftWidth: 3,
    borderLeftColor: '#A78BFA',
  },
  iconWrapperActive: {
    backgroundColor: '#7C3AED',
  },
  itemLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    letterSpacing: 0.2,
  },
  userSection: {
    alignItems: 'center',
    flexDirection:'row',
    gap:16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  loginSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 6,
  },
  loginTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 12,
  },
  loginBtnHitArea: {
    alignSelf: 'flex-start',
  },
  loginBtnRow: {
    flexDirection: 'row',
  },
  loginBtnLeft: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 40,
    borderTopColor: 'transparent',
    borderRightWidth: 12,
    borderRightColor: '#7C3AED',
  },
  loginBtnMid: {
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnRight: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderBottomWidth: 40,
    borderBottomColor: 'transparent',
    borderLeftWidth: 12,
    borderLeftColor: '#7C3AED',
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
});
