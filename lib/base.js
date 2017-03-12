'use strict'

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
  config.appConfigDirName = 'noth'
  config.appDirPath = util.getAppDir()
  config.nodeEnv = process.env.NODE_ENV || 'production'
  
  config.baseConfigFileName = 'base.default.js'
  config.baseConfigFilePath = util.resolveNothPath('./config', config.baseConfigFileName)

  // Check if the package is installed locally
  // Throw exception if it's installed globally
  if (!util.isPkgLocal()) {
    throw new Error(`Nodething: The "${config.pkgName}" package should be installed locally, e.g. \`$ npm install --save nodething\``)
  }

  // Checks if the server attribute is express.js server instance
  if (typeof server !== 'function' || server.name !== 'app') {
    throw new Error(`Nodething: Wrong usage! Try 
		\`const express = require('express')
			const noth = require('nodething')
			const server = express()
			noth(server)\`
		`)
  }

  // Checks if the config folder for noth
  // exists - subdir of the app folder
  // Checks for {app-folder}/noth folder structure
  // Also checks if the base config for the app is existed config
  if (!config.isAppConfigExists('base')) {
    // Create noth config folder which is app specific 
    // and should contains config settings which are required 
    // for initializing this package, e.g. db connect, static 
    // files generation, etc.
    config.generateAppConfig('base')
  }
}
