const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

const singleFirebaseInstanceOrigin = path.join(projectRoot, 'package.json')

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isFirebase = moduleName === 'firebase' || moduleName.startsWith('firebase/')
  const resolveFrom = isFirebase ? { ...context, originModulePath: singleFirebaseInstanceOrigin } : context
  return context.resolveRequest(resolveFrom, moduleName, platform)
}

module.exports = config
