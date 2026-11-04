import { AccountDeletionError } from '@fulbito/firebase'
import { DrawerMenu } from '@/components/drawer-menu'
import { styles } from '@/components/navbar.styles'
import { PrimaryGradient } from '@/components/primary-gradient'
import NotificationBadge from '@/components/ui/notification-badge/notification-badge'
import { UserAvatar } from '@/components/user-avatar'
import type { User } from '@/constants/auth'
import { PrimaryColors, Spacing } from '@/constants/theme'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'
import { useCanManageTournamentMembers } from '@/hooks/use-can-manage-tournament'
import { useLinkedPlayer } from '@/hooks/use-linked-player'
import { usePendingPlayerRequests } from '@/hooks/use-pending-player-requests'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { router, usePathname, type Href } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const OPEN = { duration: 420, easing: Easing.out(Easing.cubic) }
const CLOSE = { duration: 300, easing: Easing.in(Easing.cubic) }
const LOGO = require('@/assets/images/logo-ball.png')

export function Navbar() {
  const { user: authUser, signOut, deleteUser } = useFirebaseAuth()

  const { activeTournament } = useTournaments()
  const canManageMembers = useCanManageTournamentMembers()
  const linkedPlayer = useLinkedPlayer(activeTournament?.membership.playerId ?? undefined)
  const { requests } = usePendingPlayerRequests()
  const pendingCount = requests.length
  const tournamentId = activeTournament?.tournament.id ?? null

  const user = useMemo<User | null>(() => {
    if (!authUser) return null
    return {
      name: linkedPlayer?.name ?? authUser.email.split('@')[0],
      email: authUser.email,
      role: authUser.role,
      image: linkedPlayer?.photoUrl ?? null,
    }
  }, [authUser, linkedPlayer])

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
              router.replace('/login')
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof AccountDeletionError
                  ? error.message
                  : 'No se pudo eliminar la cuenta. Intenta nuevamente.',
              )
            }
          },
        },
      ],
      { cancelable: true },
    )
  }, [deleteUser])

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

  const goTo = useCallback(
    (path: Href) => {
      close()
      router.push(path)
    },
    [close],
  )

  const pathname = usePathname()
  const isOnTournaments = pathname.startsWith('/tournaments')
  const returnPath = useRef<string | null>(null)

  const openTournaments = useCallback(() => {
    if (!isOnTournaments) returnPath.current = pathname
    close()
    router.navigate('/tournaments')
  }, [isOnTournaments, pathname, close])

  const toggleTournaments = useCallback(() => {
    if (!isOnTournaments) return openTournaments()
    if (!activeTournament) return
    router.navigate((returnPath.current ?? '/home') as Href)
    returnPath.current = null
  }, [isOnTournaments, activeTournament, openTournaments])

  return (
    <>
      <StatusBar style="light" />
      <View style={[styles.bar, { paddingTop: insets.top + Spacing.xs }]}>
        <PrimaryGradient />

        <Pressable
          onPress={() => router.navigate(activeTournament ? '/home' : '/tournaments')}
          style={styles.brand}
          accessibilityRole="link"
          accessibilityLabel="FulbitoApp, ir al inicio"
        >
          <Image source={LOGO} style={styles.brandLogo} contentFit="contain" accessible={false} />
          <Text style={styles.primaryText}>FulbitoApp</Text>
        </Pressable>

        {user ? (
          <View style={styles.actions}>
            <Pressable
              onPress={toggleTournaments}
              hitSlop={8}
              style={({ pressed }) => [
                styles.tournamentChip,
                isOnTournaments && styles.tournamentChipActive,
                pressed && styles.tournamentChipPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                activeTournament ? `Torneo activo: ${activeTournament.tournament.name}` : 'Mis torneos'
              }
              accessibilityHint={isOnTournaments ? 'Vuelve a la pantalla anterior' : 'Abre Mis torneos'}
              accessibilityState={{ selected: isOnTournaments }}
            >
              {activeTournament?.tournament.photoUrl ? (
                <Image
                  source={{ uri: activeTournament.tournament.photoUrl }}
                  style={styles.tournamentPhoto}
                  contentFit="cover"
                  accessible={false}
                />
              ) : (
                <Ionicons name="trophy-outline" size={18} color={PrimaryColors.onPrimary} />
              )}
            </Pressable>

            <Pressable
              onPress={toggle}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Abrir menú de usuario"
              accessibilityState={{ expanded: isOpen }}
            >
              <UserAvatar imageUrl={user.image} size={34} ringColor={PrimaryColors.avatarRing} />
              {pendingCount > 0 && (
                <View style={styles.badge}>
                  <NotificationBadge count={pendingCount} pulse />
                </View>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => router.push('/login')} style={styles.enterBtn}>
            <Text style={styles.enterText}>ENTRAR</Text>
          </Pressable>
        )}
      </View>

      {user && (
        <DrawerMenu
          isOpen={isOpen}
          onClose={close}
          progress={progress}
          user={user}
          tournamentName={activeTournament?.tournament.name ?? null}
          canManage={canManageMembers}
          pendingCount={pendingCount}
          onOpenTournaments={openTournaments}
          onOpenMembers={() =>
            tournamentId && goTo({ pathname: '/tournaments/[id]/members', params: { id: tournamentId } })
          }
          onOpenRequests={() => goTo('/requests')}
          onOpenProfile={() => goTo('/profile')}
          onLogout={onLogout}
          onDeleteUser={onDeleteUser}
        />
      )}
    </>
  )
}
