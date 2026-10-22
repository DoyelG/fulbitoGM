import { DrawerMenu } from '@/components/drawer-menu'
import { styles } from '@/components/navbar.styles'
import { UserAvatar } from '@/components/user-avatar'
import type { User } from '@/constants/auth'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { Alert, Pressable, Text } from 'react-native'
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const OPEN = { duration: 420, easing: Easing.out(Easing.cubic) }
const CLOSE = { duration: 300, easing: Easing.in(Easing.cubic) }
const GRADIENT = ['#7C3AED', '#F97316'] as const

export function Navbar() {
  const { user: authUser, signOut, deleteUser } = useFirebaseAuth()

  const user = useMemo<User | null>(() => {
    if (!authUser) return null
    return {
      name: authUser.email.split('@')[0],
      email: authUser.email,
      role: authUser.role,
      image: null,
    }
  }, [authUser])

  const onLogout = useCallback(async () => {
    await signOut()
    router.replace('/login')
  }, [signOut])

  const onDeleteUser = useCallback(async () => {
    Alert.alert(
      'Eliminar Usuario',
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser()
              await signOut()
              router.replace('/login')
            } catch (error) {
              console.error('Error al eliminar el usuario:', error)
              Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta nuevamente.')
            }
          },
        },
      ],
      { cancelable: true },
    )
  }, [signOut, deleteUser])

  const [isOpen, setIsOpen] = useState(false)
  const progress = useSharedValue(0)
  const insets = useSafeAreaInsets()

  const toggle = useCallback(() => {
    const next = !isOpen
    setIsOpen(next)
    progress.value = withTiming(next ? 1 : 0, next ? OPEN : CLOSE)
  }, [isOpen, progress])

  const close = useCallback(() => {
    setIsOpen(false)
    progress.value = withTiming(0, CLOSE)
  }, [progress])

  return (
    <>
      <LinearGradient
        colors={GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.bar, { paddingTop: insets.top + 6, height: 50 + insets.top }]}
      >
        <Text style={styles.logo}>FULBITOAPP</Text>

        {user ? (
          <Pressable onPress={toggle} hitSlop={12}>
            <UserAvatar imageUrl={user.image} size={34} ringColor="rgba(255,255,255,0.5)" />
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/login')} style={styles.enterBtn}>
            <Text style={styles.enterText}>ENTRAR</Text>
          </Pressable>
        )}
      </LinearGradient>

      {user && (
        <DrawerMenu
          isOpen={isOpen}
          onClose={close}
          progress={progress}
          user={user}
          onLogout={onLogout}
          onDeleteUser={onDeleteUser}
        />
      )}
    </>
  )
}
