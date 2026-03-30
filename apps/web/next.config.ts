import type { NextConfig } from 'next'
import { withTamagui } from '@tamagui/next-plugin'
import browserslist from 'browserslist'
import type { ConfigurationContext } from 'next/dist/build/webpack/config/utils'
import { lazyPostCSS } from 'next/dist/build/webpack/config/blocks/css/index.js'
import { getGlobalCssLoader } from 'next/dist/build/webpack/config/blocks/css/loaders/index.js'

function getSupportedBrowsers(dir: string, isDevelopment: boolean) {
  try {
    return browserslist.loadConfig({
      path: dir,
      env: isDevelopment ? 'development' : 'production',
    })
  } catch {
    return undefined
  }
}

/**
 * Tamagui’s loader emits `.tamagui.css` modules. With App Router, `@tamagui/next-plugin`
 * can register them with a `ConfigurationContext` that omits `hasAppDir`. In dev, Next
 * then uses `next-style-loader` whose `insert` expects `#__next_css__DO_NOT_USE__` →
 * `parentNode` on null.
 *
 * Replacing **in place** (same index, no reorder) keeps Next’s `oneOf` order intact and
 * fixes the loader chain by setting `hasAppDir` / `isAppDir` so MiniCssExtract is used.
 */
function fixTamaguiCssRule(
  webpackConfig: { module?: { rules?: unknown[] } },
  options: {
    dir: string
    dev: boolean
    isServer: boolean
    config: NextConfig
  },
  userNextConfig: NextConfig
) {
  if (options.isServer) return

  const rules = webpackConfig.module?.rules
  if (!Array.isArray(rules)) return

  const cssRulesParent = rules.find(
    (rule): rule is { oneOf: unknown[] } =>
      typeof rule === 'object' &&
      rule !== null &&
      'oneOf' in rule &&
      Array.isArray((rule as { oneOf: unknown }).oneOf) &&
      (rule as { oneOf: { test?: RegExp }[] }).oneOf.some(
        ({ test }) =>
          typeof test === 'object' &&
          test !== null &&
          typeof test.test === 'function' &&
          test.test('filename.css')
      )
  )
  if (!cssRulesParent?.oneOf || !Array.isArray(cssRulesParent.oneOf)) return

  const cssRules = cssRulesParent.oneOf as Array<{
    test?: RegExp
    sideEffects?: boolean
    use?: unknown
  }>

  const cfg = options.config ?? userNextConfig
  const exp = cfg.experimental ?? {}

  const ctx: ConfigurationContext = {
    hasAppDir: true,
    isAppDir: true,
    supportedBrowsers: getSupportedBrowsers(options.dir, options.dev),
    rootDirectory: options.dir,
    customAppFile: undefined,
    isDevelopment: options.dev,
    isProduction: !options.dev,
    isServer: options.isServer,
    isClient: !options.isServer,
    isEdgeRuntime: false,
    targetWeb: true,
    assetPrefix: userNextConfig.assetPrefix ?? cfg.assetPrefix ?? '',
    sassOptions: cfg.sassOptions ?? {},
    productionBrowserSourceMaps: cfg.productionBrowserSourceMaps ?? false,
    serverSourceMaps: cfg.experimental?.serverSourceMaps ?? false,
    transpilePackages: cfg.transpilePackages ?? userNextConfig.transpilePackages ?? [],
    future: cfg.future ?? {},
    experimental: cfg.experimental ?? {},
  }

  const cssLoader = getGlobalCssLoader(
    ctx,
    () =>
      lazyPostCSS(
        options.dir,
        getSupportedBrowsers(options.dir, options.dev),
        exp.disablePostcssPresetEnv,
        exp.useLightningcss
      ),
    []
  )

  const newRule = {
    test: /\.tamagui\.css$/,
    sideEffects: true,
    use: cssLoader,
  }

  const idx = cssRules.findIndex(
    (r) => r.test instanceof RegExp && r.test.source.includes('tamagui')
  )
  if (idx !== -1) {
    cssRules[idx] = newRule
  } else {
    cssRules.unshift(newRule)
  }
}

const nextConfig: NextConfig = {
  transpilePackages: ['@fulbito/utils', '@fulbito/types', '@fulbito/ui', '@fulbito/state'],
  webpack: (config, options) => {
    fixTamaguiCssRule(config, options, nextConfig)
    return config
  },
}

export default withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui'],
})(nextConfig)
