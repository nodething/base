'use strict'

const path = require('path')
const R = require('ramda')
const util = require('./util')

var hasAppConfigDir
var isAppConfigExists

const configObj = Object.create(null, {
  hasAppConfigDir: {
    configurable: false,
    enumerable: false,
    // Checks if the app's nodething config folder exists
    get: function () {
      this._throwIfAppDirNotExists()

      if (typeof hasAppConfigDir === 'undefined') {
        hasAppConfigDir = util.hasDirSync(this.appConfigDirPath)
      }

      return hasAppConfigDir
    }
  },

  appConfigDirPath: {
    configurable: false,
    enumerable: false,
    get: function () {
      return path.join(this.appDirPath, this.appConfigDirName)
    }
  },

  appConfigFilePath: {
    configurable: false,
    enumerable: false,
    get: function () {
      return path.join(this.appConfigDirPath, this.configFileName)
    }
  },

  _throwIfAppDirNotExists: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function () {
      if (!this.appDirPath) {
        throw new Error('Nodething: Missing path - app folder')
      }
    }
  },

  isAppConfigExists: {
    configurable: false,
    enumerable: false,
    // Checks if the app's config file exists
    get: function () {
      this._throwIfAppDirNotExists()

      if (!this.hasAppConfigDir) {
        return false
      }

      if (typeof isAppConfigExists === 'undefined') {
        const configFileNames = util.getFilesSync(this.appConfigDirPath)

        // Checks if exists file with name `base.default.js` or `base.{NODE_ENV}.js`
        isAppConfigExists = configFileNames.some(this._isConfigFileNameValid.bind(this, 'base'))
      }

      return isAppConfigExists
    }
  },

  _isConfigFileNameValid: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (type, fn) {
      if(!fn) {
        return false
      }
      return new RegExp(`${type}.default.js|${type}.${this.nodeEnv}.js`, 'gi').test(fn)
    }
  },

  // Re/generates files structure which should be used
  // by this package. The generated config files and
  // folders are application specific and contains settings
  // which can be specified and changed by the user
  generateAppConfig: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function () {
      this._throwIfAppDirNotExists()

      if (!this.hasAppConfigDir) {
        this._createAppConfigDir()
      }

      if (!this.isAppConfigExists) {
        this._createAppConfig()
      }
    }
  },

  _createAppConfigDir: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function () {
      // Create app config dir
      util.createDirSync(this.appConfigDirPath)

      // Set app config dir already exists
      hasAppConfigDir = true
    }
  },

  _createAppConfig: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function () {
      // Require noth config file
      const nothConfigFile = require(this.nothConfigFilePath)

      // Create config string and save it to app config file
      util.createFileSync(this.appConfigFilePath, util.generateConfigTxt(nothConfigFile))

      // Set app config already exists
      isAppConfigExists = true
    }
  }
})

const config = module.exports = configObj
// // Added proxy wrapper around the config object so
// // if the config is changed dynamically some event
// // should be trigered in some point in order to 
// // adjust the app to the new configuration
// const config = module.exports = new Proxy(configObj, {
//   get: (target, name) => {
//     return target[name]
//   },
//   set: (obj, prop, newval) => {
//     obj[prop] = newval
//     return true
//   }
// })
