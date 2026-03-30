import { createFulbitoTamagui } from './src/createConfig'

export const config = createFulbitoTamagui('web')

export type AppConfig = typeof config

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
