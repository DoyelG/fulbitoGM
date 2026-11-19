const { withAndroidManifest } = require('expo/config-plugins')

const PORTRAIT_FEATURE_NAME = 'android.hardware.screen.portrait'

module.exports = function withAndroidOptionalPortrait(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest
    const otherFeatures = (manifest['uses-feature'] ?? []).filter(
      (feature) => feature.$['android:name'] !== PORTRAIT_FEATURE_NAME,
    )
    manifest['uses-feature'] = [
      ...otherFeatures,
      { $: { 'android:name': PORTRAIT_FEATURE_NAME, 'android:required': 'false' } },
    ]
    return modConfig
  })
}
