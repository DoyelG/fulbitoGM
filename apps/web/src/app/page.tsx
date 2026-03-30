'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChartBarIcon, ClockIcon, PlayIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import {
  HomeFeatureCard,
  HomeScreen,
  HOME_NAV_CARDS,
  type HomeNavCard,
} from '@fulbito/ui'
import { Paragraph } from 'tamagui'

const iconFor = (path: string) => {
  const className = 'h-6 w-6 text-indigo-600'
  switch (path) {
    case '/statistics':
      return <ChartBarIcon className={className} />
    case '/players':
      return <UserGroupIcon className={className} />
    case '/match':
      return <PlayIcon className={className} />
    case '/history':
      return <ClockIcon className={className} />
    default:
      return null
  }
}

export default function Home() {
  return (
    <HomeScreen
      subtitle={
        <Paragraph>
          Organiza tus partidos, evalúa rendimientos y mantén el historial de tus equipos en un solo lugar.
        </Paragraph>
      }
      cards={HOME_NAV_CARDS}
      renderIcon={(card: HomeNavCard) => iconFor(card.path)}
      renderCard={(card: HomeNavCard, iconSlot: ReactNode) => (
        <Link href={card.path} style={{ textDecoration: 'none' }}>
          <HomeFeatureCard title={card.title} description={card.description} iconSlot={iconSlot} />
        </Link>
      )}
    />
  )
}
