'use strict'

const path = require('path')

const util = require('./util')
const config = require('./config')

module.exports = base

/**
 * Base function
 * 
 * @param {*} server Express.js server instance
 */
function base (server) {
  // Set config settings
  config.pkgName = 'nodething'
  config.nothDirName = 'noth'
  config.nothConfigDirName = `${config.nothDirName}/conf`
  config.nothServeDirName = `${config.nothDirName}/serve`
  
  config.nodeEnv = process.env.NODE_ENV || 'production'
  config.appDirPath = util.getAppDir()
  
  config.appNothDirPath = path.join(config.appDirPath,  config.nothDirName)
  
  config.baseConfigFileName = 'base.default.js'
  config.baseConfigFilePath = util.resolveNothPath('./config', config.baseConfigFileName)

  // Check if the package is installed locally
  // and throw exception if it's installed globally
  if (!util.isPkgLocal()) {
    throw new Error(`Nodething: The "${config.pkgName}" package should be installed locally, e.g. \`$ npm install --save nodething\``)
  }

  // Checks if the server attribute is express.js server instance
  if (typeof server !== 'function' || server.name !== 'app') {
    throw new Error(`Nodething: Wrong usage! Try 
		\`var express = require('express');
			var noth = require('nodething');

			var server = express();
			noth(server);\`
		`)
  }

  // Checks if the `{app-path}/noth` folder exists
  if(!util.hasDirSync(config.appNothDirPath)) {
    // Creates app folder which will be used by noth
    util.createDirSync(config.appNothDirPath)
  }

  // Checks for the `{app-path}/noth/conf` folder structure
  // and also checks if the base config file for the app exists
  if (!config.isAppConfigExists('base')) {
    // Create noth config folder which is app specific 
    // and should contains config settings, which are required 
    // for the initializing of this package, e.g. db connect, 
    // static files generation, plugins settings files, etc.
    config.generateAppConfig('base')
  }
}
