import { styles } from '@/components/drawer-menu.styles'
import NotificationBadge from '@/components/ui/notification-badge/notification-badge'
import { UserAvatar } from '@/components/user-avatar'
import { Ionicons } from '@expo/vector-icons'
import * as Application from 'expo-application'
import React, { type ComponentProps } from 'react'
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useAnimatedStyle, interpolate, type SharedValue } from 'react-native-reanimated'
import { User } from '@/constants/auth'
import { DrawerColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

type DrawerMenuProps = {
  isOpen: boolean
  onClose: () => void
  progress: SharedValue<number>
  user: User
  tournamentName: string | null
  canManage: boolean
  pendingCount: number
  onOpenTournaments: () => void
  onOpenMembers: () => void
  onOpenRequests: () => void
  onOpenProfile: () => void
  onLogout: () => void
  onDeleteUser: () => void
}

type DrawerItemProps = {
  icon: ComponentProps<typeof Ionicons>['name']
  label: string
  subtitle?: string
  badgeCount?: number
  tone?: 'default' | 'danger'
  iconColor?: string
  hint?: string
  onPress: () => void
}

function DrawerItem({
  icon,
  label,
  subtitle,
  badgeCount,
  tone = 'default',
  iconColor,
  hint,
  onPress,
}: DrawerItemProps) {
  const isDanger = tone === 'danger'

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${label}: ${subtitle}` : label}
      accessibilityHint={hint}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <View style={[styles.iconWrapper, isDanger && !iconColor && styles.dangerIconWrapper]}>
        <Ionicons name={icon} size={20} color={iconColor ?? (isDanger ? DrawerColors.danger : DrawerColors.icon)} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemLabel, isDanger && !iconColor && styles.dangerLabel]}>{label}</Text>
        {subtitle && (
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {badgeCount !== undefined && (
        <View style={styles.itemBadge}>
          <NotificationBadge count={badgeCount} />
        </View>
      )}
    </Pressable>
  )
}

export function DrawerMenu({
  isOpen,
  onClose,
  progress,
  user,
  tournamentName,
  canManage,
  pendingCount,
  onOpenTournaments,
  onOpenMembers,
  onOpenRequests,
  onOpenProfile,
  onLogout,
  onDeleteUser,
}: DrawerMenuProps) {
  const insets = useSafeAreaInsets()
  const { colors } = useAppTheme()
  const { height: windowHeight } = useWindowDimensions()

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }))

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [windowHeight, 0]) }],
  }))

  return (
    <View style={[StyleSheet.absoluteFill, styles.root]} pointerEvents={isOpen ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar menú" />
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
          <DrawerItem
            icon="trophy-outline"
            label="Mis torneos"
            subtitle={tournamentName ?? 'Elegí un torneo'}
            onPress={onOpenTournaments}
          />
          {tournamentName && <DrawerItem icon="people-outline" label="Miembros" onPress={onOpenMembers} />}
          {tournamentName && canManage && (
            <DrawerItem
              icon="mail-unread-outline"
              label="Solicitudes"
              badgeCount={pendingCount}
              onPress={onOpenRequests}
            />
          )}
          <DrawerItem icon="person-outline" label="Ver perfil" onPress={onOpenProfile} />
          <DrawerItem icon="log-out-outline" label="Cerrar sesión" tone="danger" onPress={onLogout} />
          <DrawerItem
            icon="trash-outline"
            label="Eliminar Usuario"
            tone="danger"
            iconColor={colors.danger}
            hint="Elimina tu cuenta de forma permanente"
            onPress={onDeleteUser}
          />
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
