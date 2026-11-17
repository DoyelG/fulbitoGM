const { withPodfile, withXcodeProject } = require('expo/config-plugins')

const NSE_TARGET_PATTERN = /^(target 'NotifyKitNSE' do\n)(?!\s*use_frameworks!)/m
const FIRST_APP_TARGET_PATTERN = /^target '(?!NotifyKitNSE')/m
const NOTIFEE_EXTENSION_FLAG = '$NotifeeExtension = true'

function addNotifeeExtensionFlag(podfile) {
  if (podfile.includes(NOTIFEE_EXTENSION_FLAG)) return podfile
  return podfile.replace(FIRST_APP_TARGET_PATTERN, (firstTarget) => `${NOTIFEE_EXTENSION_FLAG}\n\n${firstTarget}`)
}

module.exports = function withNseDynamicFrameworks(config) {
  const configWithPodfile = withPodfile(config, (modConfig) => {
    const podfileWithFrameworks = modConfig.modResults.contents.replace(
      NSE_TARGET_PATTERN,
      '$1  use_frameworks! :linkage => :dynamic\n',
    )
    modConfig.modResults.contents = addNotifeeExtensionFlag(podfileWithFrameworks)
    return modConfig
  })

  return withXcodeProject(configWithPodfile, (modConfig) => {
    Object.values(modConfig.modResults.pbxXCBuildConfigurationSection()).forEach(({ buildSettings }) => {
      if (String(buildSettings?.PRODUCT_NAME).includes('NotifyKitNSE')) {
        buildSettings.DEVELOPMENT_TEAM = modConfig.ios.appleTeamId
      }
    })
    return modConfig
  })
}
