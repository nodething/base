'use strict'

const path = require('path')
const R = require('ramda')

const util = require('@noth/util')
const log = require('@noth/log').instance

module.exports = Object.create({}, {
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

  // Gets app conf file options
  getConfFromFile: Object.assign({
    // Function
    value: function ({ type, path = [], name, alt }) {
      const nothConf = this.getNothConfFile(type)

      var appConf
      // Get the app noth conf file if it exists
      if (this.isAppNothConfFileExists(type)) {
        appConf = this.getAppConfFile(type)
      }

      // Alternative config from the node conf file 
      if (alt) {
        if (!R.path(path.concat([name]), nothConf)) {
          log('warn', `Noth: Missing alt conf: ${name}`)
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
        throw new Error(`Noth: Missing required option: ${name}`)
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
      util.fs.createFileSync(this.appConfFilePath(type), util.tmpl.generateConfigFile(options))
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
