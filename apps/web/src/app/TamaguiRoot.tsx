'use client'

import type { ReactNode } from 'react'
import { TamaguiProvider } from 'tamagui'
import config from '../../tamagui.config'

export default function TamaguiRoot({ children }: { children: ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      {children}
    </TamaguiProvider>
  )
}
