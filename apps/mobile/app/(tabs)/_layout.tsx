import { Tabs } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

import { Navbar } from '@/components/navbar'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
            borderTopWidth: isDark ? 0 : 1,
            borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
          },
          tabBarItemStyle: {
            paddingVertical: 8,
          },
          tabBarActiveTintColor: isDark ? Colors.dark.brand : Colors.light.brand,
          tabBarInactiveTintColor: isDark ? Colors.dark.icon : Colors.light.icon,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="history" options={{ tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} /> }} />
        <Tabs.Screen name="statistics" options={{ tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={24} color={color} /> }} />
        <Tabs.Screen name="home" options={{ tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} /> }} />
        <Tabs.Screen name="players" options={{ tabBarIcon: ({ color }) => <MaterialIcons name="group" size={24} color={color} /> }} />
        <Tabs.Screen name="match" options={{ tabBarIcon: ({ color }) => <MaterialIcons name="sports-soccer" size={24} color={color} /> }} />
      </Tabs>
    </View>
  )
}
