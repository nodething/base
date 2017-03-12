'use strict'

const util = require('./util')
const config = require('./config')

module.exports = function (server) {
  // Set config settings
  config.pkgName = 'nodething'
  config.appConfigDirName = 'nt'
  config.rootDir = util.getAppRootDir()

  // Check if the package is installed locally
  // Throw exception if it's installed globally
  if (!util.isPkgLocal()) {
    throw new Error(`Nodething: The "${config.pkgName}" package should be installed locally, e.g. \`$ npm i -E nodething\``)
  }

  // Checks if the server attribute is express.js server instance
  if (typeof server !== 'function' || server.name !== 'app') {
    throw new Error(`Nodething: Wrong usage! Try 
		\`const express = require('express')
			const nt = require('nodething')
			const server = express()
			nt(server)\`
		`)
  }

  // Checks if the config folder for nodething
  // exists - subdir of the app folder
  // Checks for {app-folder}/nt folder structure
	// Also checks if the existed config(if any) is valid
  if (!config.hasAppConfigSync || config.isAppConfigValid) {
    // Create nodething config folder which is app specific 
    // and should contains config settings which are required 
    // for initializing this package, e.g. db connect, static 
    // files generation, etc.
    config.regenerateAppConfig()
  }
}
