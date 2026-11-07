import { router, Tabs, usePathname } from 'expo-router'
import React, { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import { Navbar } from '@/components/navbar'
import { Colors } from '@/constants/theme'
import { useTournaments } from '@/contexts/TournamentContext'
import { useColorScheme } from '@/hooks/use-color-scheme'

import { styles } from '@/components/tabs-layout.styles'

const ROUTES_WITHOUT_TOURNAMENT = ['/tournaments', '/profile']

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const palette = isDark ? Colors.dark : Colors.light
  const activeIconColor = palette.primaryText
  const pathname = usePathname()
  const { status, activeTournament } = useTournaments()
  const hasActiveTournament = activeTournament !== null
  const isGated = !ROUTES_WITHOUT_TOURNAMENT.some((route) => pathname.startsWith(route))
  const shouldRedirect = isGated && (status === 'error' || (status === 'loaded' && !hasActiveTournament))

  useEffect(() => {
    if (shouldRedirect) router.replace('/tournaments')
  }, [shouldRedirect])

  const isWaiting = isGated && (status === 'loading' || shouldRedirect)

  return (
    <View style={styles.root}>
      <Navbar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: hasActiveTournament
            ? {
                backgroundColor: palette.background,
                borderTopWidth: isDark ? 0 : 1,
                borderTopColor: palette.border,
              }
            : styles.hiddenTabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarActiveTintColor: activeIconColor,
          tabBarInactiveTintColor: palette.icon,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="history"
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons name="history" size={24} color={focused ? activeIconColor : palette.icon} />
            ),
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons name="bar-chart" size={24} color={focused ? activeIconColor : palette.icon} />
            ),
          }}
        />
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons name="home" size={24} color={focused ? activeIconColor : palette.icon} />
            ),
          }}
        />
        <Tabs.Screen
          name="players"
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons name="group" size={24} color={focused ? activeIconColor : palette.icon} />
            ),
          }}
        />
        <Tabs.Screen
          name="match"
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons name="sports-soccer" size={24} color={focused ? activeIconColor : palette.icon} />
            ),
          }}
        />
        <Tabs.Screen name="tournaments" options={{ tabBarItemStyle: styles.hiddenTabItem }} />
        <Tabs.Screen name="requests" options={{ tabBarItemStyle: styles.hiddenTabItem }} />
        <Tabs.Screen name="profile" options={{ tabBarItemStyle: styles.hiddenTabItem }} />
      </Tabs>
      {isWaiting && (
        <View style={[styles.overlay, { backgroundColor: palette.background }]} accessibilityLiveRegion="polite">
          <ActivityIndicator color={palette.primaryText} accessibilityLabel="Cargando torneo" />
        </View>
      )}
    </View>
  )
}
