import { HomeFeatureCard, HomeScreen, HOME_NAV_CARDS, type HomeNavCard } from '@fulbito/ui'
import { Ionicons } from '@expo/vector-icons'
import { Link, type Href } from 'expo-router'
import { Pressable } from 'react-native'
import { Paragraph, YStack } from 'tamagui'
const iconFor = (path: string) => {
  const size = 24
  const color = '#4f46e5'
  switch (path) {
    case '/statistics':
      return <Ionicons name="bar-chart" size={size} color={color} />
    case '/players':
      return <Ionicons name="people" size={size} color={color} />
    case '/match':
      return <Ionicons name="football" size={size} color={color} />
    case '/history':
      return <Ionicons name="time" size={size} color={color} />
    default:
      return null
  }
}

export default function Home() {
  return (
    <YStack flex={1}>
    <HomeScreen
      subtitle="Organiza tus partidos, evalúa rendimientos y mantén el historial de tus equipos en un solo lugar."
      cards={HOME_NAV_CARDS}
      renderIcon={(card: HomeNavCard) => iconFor(card.path)}
      renderCard={(card: HomeNavCard, iconSlot) => (
        <Link href={card.path as Href} asChild>
          <Pressable>
            <HomeFeatureCard title={card.title} description={card.description} iconSlot={iconSlot} />
          </Pressable>
        </Link>
      )}
    />
    <YStack padding={20} alignItems="center">
      <Link href="/login" asChild>
        <Pressable>
          <Paragraph color="#7c3aed" fontWeight="600">
            Iniciar sesión (misma cuenta que la web)
          </Paragraph>
        </Pressable>
      </Link>
    </YStack>
    </YStack>
  )
}
