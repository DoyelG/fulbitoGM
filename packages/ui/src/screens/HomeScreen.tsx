import type { ReactNode } from 'react'
import { Platform } from 'react-native'
import { Paragraph, XStack, YStack } from 'tamagui'
import { HeroTitle, PageChrome } from '../components/PageChrome'

export type HomeNavCard = {
  path: string
  title: string
  description: string
}

export const HOME_NAV_CARDS: HomeNavCard[] = [
  { path: '/statistics', title: 'Estadísticas', description: 'Ver estadísticas de los jugadores' },
  { path: '/players', title: 'Jugadores', description: 'Gestiona tus jugadores' },
  { path: '/match', title: 'Preparar partido', description: 'Arma tu partido' },
  { path: '/history', title: 'Historial de partidos', description: 'Ver historial de partidos' },
]

const webBg =
  Platform.OS === 'web'
    ? ({
        backgroundImage: [
          'radial-gradient(1000px 600px at 10% -20%, rgba(99,102,241,0.14), transparent)',
          'radial-gradient(800px 500px at 90% 0, rgba(236,72,153,0.14), transparent)',
        ].join(', '),
      } as const)
    : undefined

type Props = {
  subtitle: ReactNode
  cards?: HomeNavCard[]
  renderCard: (card: HomeNavCard, iconSlot: ReactNode) => ReactNode
  renderIcon: (card: HomeNavCard) => ReactNode
}

export function HomeScreen({ subtitle, cards = HOME_NAV_CARDS, renderCard, renderIcon }: Props) {
  const subtitleBlock =
    typeof subtitle === 'string' ? (
      <Paragraph
        textAlign="center"
        color="$color.textSecondary"
        fontSize={16}
        lineHeight={22}
        maxWidth={640}
        alignSelf="center"
        marginBottom={16}
      >
        {subtitle}
      </Paragraph>
    ) : (
      <YStack maxWidth={640} alignSelf="center" marginBottom={16}>
        {subtitle}
      </YStack>
    )

  return (
    <PageChrome>
      <YStack
        flex={Platform.OS === 'web' ? undefined : 1}
        minHeight={Platform.OS === 'web' ? ('100vh' as const) : undefined}
        backgroundColor={Platform.OS === 'web' ? undefined : '$background'}
        style={webBg}
      >
        <HeroTitle>FulbitoApp</HeroTitle>
        {subtitleBlock}
        <XStack
          flexWrap="wrap"
          gap={16}
          justifyContent="center"
          width="100%"
          alignSelf="center"
          maxWidth={1920}
          $gtSm={{ gap: 20 }}
          $gtMd={{ gap: 24 }}
        >
          {cards.map((card) => (
            <YStack
              key={card.path}
              width="100%"
              maxWidth={440}
              minWidth={200}
              alignSelf="stretch"
              $gtSm={{ width: '48%', maxWidth: 440, minWidth: 260 }}
              $gtMd={{ width: '48%', maxWidth: 460 }}
              $gtLg={{ width: '24%', minWidth: 272, maxWidth: 340 }}
            >
              {renderCard(card, renderIcon(card))}
            </YStack>
          ))}
        </XStack>
      </YStack>
    </PageChrome>
  )
}
