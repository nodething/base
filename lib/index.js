'use strict'

const path = require('path')
const R = require('ramda')

const util = require('@noth/util')
const config = require('@noth/config')
const log = require('@noth/log').instance
const nothModule = require('@noth/module')

module.exports = base

/**
 * Base function
 * 
 * @param {*} server Express.js server instance
 * @param {Object} options noth options
 */
function base(server, options) {
  // Private vars
  var hasNothDir
  var hasAppBaseConfig

  // Set config settings
  config.pkgName = 'noth'
  config.nothDirName = 'noth'
  config.nothConfigDirName = `${config.nothDirName}/conf`
  config.nothServeDirName = `${config.nothDirName}/serve`

  config.nodeEnv = process.env.NODE_ENV || 'production'
  config.appDirPath = util.getAppDir()

  config.appNothDirPath = path.join(config.appDirPath, config.nothDirName)

  config.baseConfigFileName = 'base.default.js'
  config.baseConfigFilePath = util.resolveNothPath('./config', config.baseConfigFileName)

  // Check if the package is installed locally
  // and throw exception if it's installed globally
  if (!util.isPkgLocal()) {
    throw new Error(`Noth: The "${config.pkgName}" package should be installed locally, e.g. \`$ npm install --save noth\``)
  }

  // Checks if the server attribute is express.js server instance
  if (typeof server !== 'function' || server.name !== 'app') {
    throw new Error(`Noth: Wrong usage! Try 
    \`var express = require('express');
      var noth = require('noth');

      var server = express();
      noth(server);\`
    `)
  }

  try {
    hasNothDir = util.hasDirSync(config.appNothDirPath)
  } catch (err) {
    config.regErr('fs', err)
  }

  // Checks if the `{app-path}/noth` folder exists
  if (!config.hasErr('fs') && hasNothDir === false) {
    // Creates app folder which will be used by noth
    try {
      util.createDirSync(config.appNothDirPath)
    } catch (err) {
      config.regErr('fs', err)
    }
  }

  if (!config.hasErr('fs')) {
    try {
      hasAppBaseConfig = config.isAppConfigExists('base')
    } catch (err) {
      config.regErr('config:base', err)
    }
  }

  // Checks for the `{app-path}/noth/conf` folder structure
  // and also checks if the base config file for the app exists
  if (!config.hasErr('config:base') && hasAppBaseConfig === false) {
    // Create noth config folder which is app specific
    // and should contains config settings, which are required
    // for the initializing of this package, e.g. db connect,
    // static files generation, plugins settings files, etc.
    try {
      config.generateAppConfig('base')
    } catch (err) {
      config.regErr('config:base', err)
    }
  }

  // Load dynamic modules
  const modulesNames = config.modules
  const nothModules = R.map((name) => nothModule.init('base', name), modulesNames)

  Promise.all(nothModules)
    .then((nothModules) => {
      log('debug', 'noth: native modules loading: completed')
    })
    .catch((err) => {
      log('error', err)
    })
}
