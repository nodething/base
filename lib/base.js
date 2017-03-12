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
  config.appConfigDir = 'nodething'
  config.appDir = util.getAppDir()

  // Check if the package is installed locally
  // Throw exception if it's installed globally
  if (!util.isPkgLocal()) {
    throw new Error(`Nodething: The "${config.pkgName}" package should be installed locally, e.g. \`$ npm install --save nodething\``)
  }

  // Checks if the server attribute is express.js server instance
  if (typeof server !== 'function' || server.name !== 'app') {
    throw new Error(`Nodething: Wrong usage! Try 
		\`const express = require('express')
			const nodething = require('nodething')
			const server = express()
			nodething(server)\`
		`)
  }

  // Checks if the config folder for nodething
  // exists - subdir of the app folder
  // Checks for {app-folder}/nt folder structure
  // Also checks if the existed config(if any) is valid
  if (!config.hasAppConfig || config.isAppConfigValid) {
    // Create nodething config folder which is app specific 
    // and should contains config settings which are required 
    // for initializing this package, e.g. db connect, static 
    // files generation, etc.

    // TODO: implement
    config.regenerateAppConfig()
  }
}
