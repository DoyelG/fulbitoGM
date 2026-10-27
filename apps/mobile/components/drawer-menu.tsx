import { styles } from '@/components/drawer-menu.styles'
import NotificationBadge from '@/components/ui/notification-badge/notification-badge'
import { UserAvatar } from '@/components/user-avatar'
import { Ionicons } from '@expo/vector-icons'
import * as Application from 'expo-application'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useAnimatedStyle,
  interpolate,
  type SharedValue,
} from 'react-native-reanimated';
import { User } from '@/constants/auth';



interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  progress: SharedValue<number>;
  user: User;
  pendingCount: number;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
  onDeleteUser: () => void;
}

export function DrawerMenu({
  isOpen,
  onClose,
  progress,
  user,
  pendingCount,
  onOpenProfile,
  onOpenNotifications,
  onLogout,
  onDeleteUser,
}: DrawerMenuProps) {
  const insets = useSafeAreaInsets()

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }))

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
          <UserAvatar imageUrl={user.image} size={44} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.divider} />
          <Pressable
            onPress={onOpenProfile}
            accessibilityRole="button"
            accessibilityLabel="Ver perfil"
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name="person-outline" size={20} color="#A78BFA" />
            </View>
            <Text style={styles.itemLabel}>Ver perfil</Text>
          </Pressable>
          <Pressable
            onPress={onOpenNotifications}
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name="notifications-outline" size={20} color="#A78BFA" />
            </View>
            <Text style={styles.itemLabel}>Notificaciones</Text>
            <View style={styles.itemBadge}>
              <NotificationBadge count={pendingCount} />
            </View>
          </Pressable>
          <Pressable
            onPress={onLogout}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={[styles.iconWrapper, styles.dangerIconWrapper]}>
              <Ionicons name="log-out-outline" size={20} color="#F87171" />
            </View>
            <Text style={[styles.itemLabel, styles.dangerLabel]}>Cerrar sesión</Text>
          </Pressable>

          <Pressable onPress={onDeleteUser} style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
            <View style={styles.iconWrapper}>
              <Ionicons name="trash-outline" size={20} color="#FF0000" />
            </View>
            <Text style={styles.itemLabel}>Eliminar Usuario</Text>
          </Pressable>
          <View style={styles.appVersionInfo}>
            <Text style={styles.appVersionText}>
              v{Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  )
}
