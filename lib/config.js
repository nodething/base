'use strict'

const path = require('path')
const R = require('ramda')
const util = require('./util')

var _hasAppConfigDir
var _isAppConfigExists

const configObj = Object.create(null, {
  // Checks if the app's noth config folder exists
  hasAppConfigDir: {
    configurable: false,
    enumerable: false,
    get: function () {
      this._throwIfAppDirNotExists()

      if (typeof _hasAppConfigDir === 'undefined') {
        _hasAppConfigDir = util.hasDirSync(this.appConfigDirPath)
      }

      return _hasAppConfigDir
    }
  },

  // Returns the path of the app config dir used by noth
  appConfigDirPath: {
    configurable: false,
    enumerable: false,
    get: function () {
      return path.join(this.appDirPath, this.appConfigDirName)
    }
  },

  // Returns the path of the app config file used by noth
  appConfigFilePath: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (type) {
      return path.join(this.appConfigDirPath, this[`${type}ConfigFileName`])
    }
  },

  // Throws app exception if the app folder path is not found
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

  // Checks if the app config file used by noth exists
  isAppConfigExists: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Checks if the app's config file exists
    value: function (type) {
      this._throwIfAppDirNotExists()

      if (!this.hasAppConfigDir) {
        return false
      }

      if (typeof _isAppConfigExists === 'undefined') {
        const configFileNames = util.getFilesSync(this.appConfigDirPath)

        // Checks if exists file with name `base.default.js` or `base.{NODE_ENV}.js`
        _isAppConfigExists = configFileNames.some(this._isConfigFileNameMatch.bind(this, type))
      }

      return _isAppConfigExists
    }
  },

  // Checks if the noth config filename match a pattern 
  _isConfigFileNameMatch: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (type, fn) {
      if (!fn) {
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
    value: function (type) {
      this._throwIfAppDirNotExists()

      if (!this.hasAppConfigDir) {
        this._createAppConfigDir()
      }

      if (!this.isAppConfigExists(type)) {
        this._generateAppConfig(type)
      }
    }
  },

  // Creates app folder which will be used by noth
  // for configuration files
  _createAppConfigDir: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function () {
      // Create app config dir
      util.createDirSync(this.appConfigDirPath)

      // Set app config dir already exists
      _hasAppConfigDir = true
    }
  },

  // Creates app file which will be used by noth
  // for configuration settings
  _generateAppConfig: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (type) {
      // Require noth config file
      const configFile = require(this[`${type}ConfigFilePath`])

      // Create config string and save it to app config file
      util.createFileSync(this.appConfigFilePath(type), util.generateConfigTxt(configFile))

      // Set app config already exists
      _isAppConfigExists = true
    }
  }
})

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
