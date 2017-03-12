'use strict'

const path = require('path')
const util = require('./util')

const pkgDefaultConfigProps = ['pkgName', 'rootDir', 'appConfigDirName']

const config = Object.create(null)

Object.defineProperty(config, 'hasAppConfigSync', {
  configurable: false,
  enumerable: false,
  // Checks if the app's nodething folder config exists
  get: () => {
    checkHasRootDir()

    return util.hasDirSync(path.join(config.rootDir, config.appConfigDirName))
  }
})

Object.defineProperty(config, 'isAppConfigValid', {
  configurable: false,
  enumerable: false,
  // Checks if the app's nodething folder config exists
  get: () => {
		checkHasRootDir()

    // TODO: Check if app config is valid
  }
})

function checkHasRootDir () {
  if (!config.rootDir) {
    throw new Error('Nodething: Missing path - app root folder')
  }
}

// Re/generates files structure which should be used
// by this package. The generated config files and
// folders are application specific and contains settings
// which can be specified and changed by the user
config.regenerateAppConfig = () => {
  // TODO: regenerate app config
}

module.exports = config
