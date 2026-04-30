import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { styles } from '@/components/drawer-menu.styles';
import Animated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';



interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SharedValue<number>;
  user: { name: string; email: string; role: string; image: string | null };
  onLogout: () => void;
}

export function DrawerMenu({ isOpen, onClose, progress, user, onLogout }: DrawerMenuProps) {
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

        <>
          <View style={styles.divider} />
          {user.role === 'USER' && (
            <Pressable onPress={() => {}} style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
              <View style={styles.iconWrapper}>
                <Ionicons name="shield-outline" size={20} color="#A78BFA" />
              </View>
              <Text style={styles.itemLabel}>Solicitar acceso administrador</Text>
            </Pressable>
          )}
          <Pressable onPress={onLogout} style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
            <View style={styles.iconWrapper}>
              <Ionicons name="log-out-outline" size={20} color="#A78BFA" />
            </View>
            <Text style={styles.itemLabel}>Cerrar sesión</Text>
          </Pressable>
        </>
      </Animated.View>
    </View>
  );
}

