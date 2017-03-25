'use strict'

const path = require('path')
const R = require('ramda')

const util = require('@noth/util')
const log = require('@noth/log').instance
const ConfError = require('@noth/error').ConfError

const conf = Object.create({
  STATUSES: {
    IDLE: 'status:idle',
    ERROR: 'status:error',
    LOADING: 'status:loading',
    READY: 'status:ready'
  }
}, {
  // Checks if the app conf file used by noth exists
  isAppNothConfFileExists: Object.assign({
    // Checks if the app's conf file exists
    value: function (type) {
      if (!util.fs.hasDirSync(this.appNothDirPath) || !util.fs.hasDirSync(this.appNothConfDirPath)) {
        return false
      }

      const confFileNames = util.fs.getFilesSync(this.appNothConfDirPath)

      // Checks if exists file with name `{type}.default.js` or `{type}.{NODE_ENV}.js`
      return confFileNames.some(this._isConfFileNameMatch.bind(this, type))
    }
  }, util.obj.propValueFnOptions),

  // Returns the path of the app conf dir used by noth
  appNothConfDirPath: Object.assign({
    get: function () {
      return path.join(this.appNothDirPath, this.nothConfDirName)
    }
  }, util.obj.propGetOptions),

  // Gets noth conf file
  getNothConfFile: Object.assign({
    // Function
    value: function (type) {
      // Returns noth conf file
      return require(this[`${type}ConfFilePath`])
    }
  }, util.obj.propValueFnOptions),

  // Returns if the noth conf option required
  isConfOptionRequired: Object.assign({
    value: function ({type, path = [], name}) {
      const nothConf = this.getNothConfFile(type)

      return R.path(path.concat([name, 'required']), nothConf)
    }
  }, util.obj.propValueFnOptions),

  // Gets app conf file options
  getConfFromFile: Object.assign({
    value: function ({ type, path = [], name, alt }) {
      const nothConf = this.getNothConfFile(type)

      var appConf
      // Get the app noth conf file if it exists
      if (this.isAppNothConfFileExists(type)) {
        appConf = this.getAppConfFile(type)
      }

      // Alternative conf from the node conf file 
      if (alt) {
        if (!R.path(path.concat([name]), nothConf)) {
          log('debug', `noth: Missing alt conf: ${name}`)
          return
        }

        return R.path(path.concat([name, 'alt']), nothConf)
      }

      // Returns app conf options
      if (appConf && appConf.hasOwnProperty(name)) {
        return R.path(path.concat([name]), appConf)
      }

      // Throw error if the conf option is required, 
      // which means that the option must be set in the
      // app conf files and cannot be used a default value
      if (appConf && R.path(path.concat([name, 'required']), nothConf)) {
        throw new ConfError(`Noth: Missing required option: ${name}`)
      }

      return R.path(path.concat([name, 'default']), nothConf)
    }
  }, util.obj.propValueFnOptions),

  // Generates files structure which should be used
  // by this package. The generated conf files and
  // folders are application specific and contains settings
  // which can be specified and changed by the user
  generateAppConf: Object.assign({
    value: function (type) {
      // Require noth conf file
      const options = this[type]

      // Create conf string and save it to app conf file
      util.fs.createFileSync(this.appConfFilePath(type), util.tmpl.generateConfFile(options))
    }
  }, util.obj.propValueFnOptions),

  // Checks if the noth conf filename match a pattern
  _isConfFileNameMatch: Object.assign({
    value: function (type, fn) {
      if (!fn) {
        return false
      }
      return new RegExp(`^${type}.default.js$|^${type}.${this.nodeEnv}.js$`, 'gi').test(fn)
    }
  }, util.obj.propValueFnOptions),

  // Returns the path of the app conf file used by noth
  appConfFilePath: Object.assign({
    value: function (type) {
      return path.join(this.appNothConfDirPath, this[`${type}ConfFileName`])
    }
  }, util.obj.propValueFnOptions),

  // Gets app conf file
  getAppConfFile: Object.assign({
    // Function
    value: function (type) {
      // Returns app conf file
      return require(this.appConfFilePath(type))
    }
  }, util.obj.propValueFnOptions)
})

/**
 * Generates proxy object which wraps a conf object.
 * The wrapped conf obj will be logged in the console
 * on properties changed
 * 
 * @param {Object} obj 
 * @param {Array} parentsPropNames Store all the parent properties, so they can be logged
 */
const logProxy = (obj, parentsPropNames = []) => {
  return new Proxy(obj, {
    set: (obj, prop, newval) => {
      // Log the changed property with the full path and the new value
      log('debug', `noth: conf prop changed: ${!parentsPropNames.length ? prop : parentsPropNames.join('.') + '.' + prop} -> ${typeof newval === 'object' ? JSON.stringify(newval) : newval}`)

      if (typeof newval !== 'object') {
        obj[prop] = newval
      } else if (typeof newval !== null) {
        // If the new value is an object wrap it with conf proxy
        obj[prop] = logProxy(newval, [...parentsPropNames, prop])
      } else {
        obj[prop] = null
      }

      return true
    }
  })
}

// Added proxy wrapper around the conf object so
// if the conf is changed dynamically some event
// should be trigered in some point in order to
// adjust the app to the new configuration
module.exports = logProxy(conf)
