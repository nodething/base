'use strict'

const path = require('path')
const util = require('./util')

const pkgDefaultConfigProps = ['pkgName', 'rootDir', 'appConfigDirName']

const configObj = Object.create(null, {
  hasAppConfigSync: {
    configurable: false,
    enumerable: false,
    // Checks if the app's nodething folder config exists
    get: () => {
      _checkHasRootDir()

      return util.hasDirSync(path.join(config.rootDir, config.appConfigDirName))
    }
  },
  isAppConfigValid: {
    configurable: false,
    enumerable: false,
    // Checks if the app's config files exists
    get: () => {
      _checkHasRootDir()

    // TODO: Check if app config is valid
    }
  }
})

// Re/generates files structure which should be used
// by this package. The generated config files and
// folders are application specific and contains settings
// which can be specified and changed by the user
configObj.regenerateAppConfig = () => {
  // TODO: regenerate app config
}

// Default export
// Added proxy wrapper around the config object so
// if the config is changed dynamically some event
// should be trigered in some point in order to 
// adjust the app to the new configuration
const config = module.exports = new Proxy(configObj, {
  get: (target, name) => {
    return target[name]
  },
  set: (obj, prop, newval) => {
    obj[prop] = newval
    return true
  }
})

function _checkHasRootDir () {
  if (!config.rootDir) {
    throw new Error('Nodething: Missing path - app root folder')
  }
}
