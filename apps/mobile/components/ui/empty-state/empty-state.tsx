import Feather from '@expo/vector-icons/Feather'
import { useRouter, type Href } from 'expo-router'
import type { ComponentProps } from 'react'
import { Pressable, View } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'
import { ThemedText } from '@/components/themed-text'
import { PrimaryColors } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './empty-state.styles'

export type EmptyStateAction = { label: string; href: Href } | { label: string; onPress: () => void }

export type EmptyStateProps = {
  icon: ComponentProps<typeof Feather>['name']
  title: string
  description?: string
  action?: EmptyStateAction | null
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { colors } = useAppTheme()
  const router = useRouter()

  const handleActionPress = () => {
    if (!action) return
    if ('href' in action) router.push(action.href)
    else action.onPress()
  }

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
        <Feather name={icon} size={36} color={colors.primaryText} accessible={false} />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.title} accessibilityRole="header">
        {title}
      </ThemedText>
      {description && <ThemedText style={[styles.description, { color: colors.muted }]}>{description}</ThemedText>}
      {action && (
        <Pressable
          onPress={handleActionPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [styles.action, pressed && { opacity: 0.9 }]}
        >
          <PrimaryGradient />
          <ThemedText style={[styles.actionText, { color: PrimaryColors.onPrimary }]}>{action.label}</ThemedText>
        </Pressable>
      )}
    </View>
  )
}
