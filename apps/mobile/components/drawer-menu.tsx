import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const USER_ACTIONS: { id: string; label: string; icon: IoniconName }[] = [
  { id: 'logout', label: 'Cerrar sesión', icon: 'log-out-outline' },
];

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SharedValue<number>;
  user: { name: string; email: string; image: string | null } | null;
}

export function DrawerMenu({ isOpen, onClose, progress, user }: DrawerMenuProps) {
  const insets = useSafeAreaInsets();

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [400, 0]) }],
  }));

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.root]}
      pointerEvents={isOpen ? 'auto' : 'none'}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />

        {user ? (
          <View style={styles.userSection}>
            <Image
              source={user.image ? { uri: user.image } : require('@/assets/images/user-placeholder.png')}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.loginSection}>
            <Text style={styles.loginTitle}>¡Bienvenido!</Text>
            <Text style={styles.loginSubtitle}>Ingresá para ver tu perfil y estadísticas</Text>
            <Pressable onPress={() => { onClose(); router.push('/login'); }} style={styles.loginBtnHitArea}>
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

        {user && (
          <>
            <View style={styles.divider} />
            {USER_ACTIONS.map((action) => (
              <Pressable
                key={action.id}
                onPress={onClose}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name={action.icon} size={20} color="#A78BFA" />
                </View>
                <Text style={styles.itemLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </>
        )}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 2,
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 14,
  },
  itemPressed: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  loginSection: {
    paddingHorizontal: 24,
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
