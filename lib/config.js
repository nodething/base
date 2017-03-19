'use strict'

const path = require('path')
const R = require('ramda')

const util = require('@noth/util')
const log = require('@noth/log').instance

const configObj = Object.create({}, {
  // Noth running state
  _state: {
    configurable: true,
    enumerable: false,
    writable: true,
    value: undefined
  },

  // Noth dynamic plugins
  modules: {
    configurable: true,
    enumerable: false,
    writable: true,
    value: ['db', 'serve']
  },

  // Noth plugins
  _plugins: {
    configurable: true,
    enumerable: false,
    writable: true,
    value: []
  },

  // General errors flags
  _errors: {
    configurable: true,
    enumerable: false,
    writable: true,
    value: {}
  },

  // Value tells if the noth config dir exists
  // in the main application
  _appConfigDirExists: {
    configurable: true,
    enumerable: false,
    writable: true,
    value: undefined
  },

  // Checks if the app's noth config folder exists
  _hasAppConfigDir: {
    configurable: false,
    enumerable: false,
    // Getter
    get: function () {
      if (typeof this._appConfigDirExists === 'undefined') {
        this._appConfigDirExists = util.hasDirSync(this.appConfigDirPath)
      }

      return this._appConfigDirExists
    }
  },

  // Returns the path of the app config dir used by noth
  appConfigDirPath: {
    configurable: false,
    enumerable: false,
    // Getter
    get: function () {
      return path.join(this.appDirPath, this.nothConfigDirName)
    }
  },

  // Returns the path of the app config file used by noth
  appConfigFilePath: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Function
    value: function (type) {
      return path.join(this.appConfigDirPath, this[`${type}ConfigFileName`])
    }
  },

  // Throws app exception if the app folder path is not found
  _throwIfAppDirNotExists: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Function
    value: function () {
      if (!this.appDirPath) {
        throw new Error('Noth: Missing path - app folder')
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

      if (!this._hasAppConfigDir) {
        return false
      }

      const configFileNames = util.getFilesSync(this.appConfigDirPath)

      // Checks if exists file with name `base.default.js` or `base.{NODE_ENV}.js`
      return configFileNames.some(this._isConfigFileNameMatch.bind(this, type))
    }
  },

  // Checks if the noth config filename match a pattern
  _isConfigFileNameMatch: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Function
    value: function (type, fn) {
      if (!fn) {
        return false
      }
      return new RegExp(`^${type}.default.js$|^${type}.${this.nodeEnv}.js$`, 'gi').test(fn)
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
    // Function
    value: function (type) {
      this._throwIfAppDirNotExists()

      if (!this._hasAppConfigDir) {
        this._createAppConfigDir()
      }

      this._generateAppConfig(type)
    }
  },

  // Creates app folder which will be used by noth
  // for configuration files
  _createAppConfigDir: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Function
    value: function () {
      // Create app config dir
      util.createDirSync(this.appConfigDirPath)

      // Set app config dir already exists
      this._appConfigDirExists = true
    }
  },

  // Creates app file which will be used by noth
  // for configuration settings
  _generateAppConfig: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Function
    value: function (type) {
      // Require noth config file
      const configFile = this.getNothConfigFile(type)

      // Create config string and save it to app config file
      util.createFileSync(this.appConfigFilePath(type), util.generateConfigTxt(configFile))
    }
  },

  // Gets noth config file
  getNothConfigFile: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Function
    value: function (type) {
      // Returns noth config file
      return require(this[`${type}ConfigFilePath`])
    }
  },

  // Gets app config file
  getAppConfigFile: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Function
    value: function (type) {
      // Returns app config file
      return require(this.appConfigFilePath(type))
    }
  },

  // Gets app config file options
  getConfigOptions: {
    configurable: false,
    enumerable: false,
    writable: false,
    // Function
    value: function ({ type, path, name, alt }) {
      const nothConfig = this.getNothConfigFile(type)
      var appConfig

      if (alt) {
        // TODO: use R.path if arg path exists
        if (!nothConfig[name]) {
          log('warn', `Noth: Missing alt conf: ${name}`)
          return
        }

        // TODO: use R.path if arg path exists
        return nothConfig[name].alt
      }

      if (!this.hasErr(`config:${type}`)) {
        appConfig = this.getAppConfigFile(type)
      }

      // Returns app config options
      // TODO: use R.path if arg path exists
      if (appConfig && appConfig.hasOwnProperty(name)) {
        // TODO: use R.path if arg path exists
        return appConfig[name]
      }

      // Throw error if the config option is required, 
      // which means that the option must be set in the
      // app config files and cannot be used a default value
      // TODO: use R.path if arg path exists
      if (nothConfig[name].required) {
        throw new Error(`Noth: Missing required option: ${name}`)
      }

      // TODO: use R.path if arg path exists
      return nothConfig[name].default
    }
  },

  // Checks if there is registered fs error
  hasErr: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (type) {
      return this._errors ? !!this._errors[type] : false
    }
  },

  // Saves an error in a object
  regErr: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (type, err) {
      log('error', err)

      this._errors[type] = err
    }
  }
})

/**
 * Generates proxy object which wraps config object.
 * The wrapped config obj will be logge in the console
 * on properties modification changes
 * 
 * @param {*} obj 
 */
const generateConfigProxy = (obj, parentsPropNames) => {
  return new Proxy(obj, {
    get: (target, name) => {
      if (target.hasOwnProperty(name)) {
        return target[name]
      }

      // Try to find config options from the config files
      var configOptions = target.getConfigOptions({ type: 'base', path: parentsPropNames, name })

      if (!configOptions) {
        log('warning', `noth: missing config prop: base -> ${name}`)
      }

      return configOptions
    },
    set: (obj, prop, newval) => {
      // Log the changed property with the full path and the new value
      log('debug', `noth: config prop changed: ${!parentsPropNames ? prop : parentsPropNames.join('.') + '.' + prop} -> ${typeof newval === 'object' ? JSON.stringify(newval) : newval}`)

      if (typeof newval !== 'object') {
        obj[prop] = newval
      } else {
        // Store all the parent properties configFileNames
        // so they can be logged
        parentsPropNames = parentsPropNames || []
        parentsPropNames.push(prop)

        // If the new value is an object wrap it with config proxy
        obj[prop] = generateConfigProxy(newval, parentsPropNames)
      }

      return true
    }
  })
}

// Added proxy wrapper around the config object so
// if the config is changed dynamically some event
// should be trigered in some point in order to
// adjust the app to the new configuration
module.exports = generateConfigProxy(configObj)
