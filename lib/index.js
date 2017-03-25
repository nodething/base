'use strict'

const path = require('path')

const util = require('@noth/util')
const conf = require('@noth/conf')
const log = require('@noth/log').instance
const WrongUsageError = require('@noth/error').WrongUsageError
const flow = require('@noth/flow')

// Default exports
module.exports = base

/**
 * Base function
 * 
 * @param {*} server Express.js server instance
 * @param {Object} options noth options
 */
function base(server, options) {
  // Set noth options
  conf.pkgName = 'noth'
  conf.nodeEnv = process.env.NODE_ENV || 'production'

  // Check if the package is installed locally
  // and throw exception if it's installed globally
  if (!util.pkg.isLocal(conf.pkgName)) {
    throw new WrongUsageError(`Noth: The "${conf.pkgName}" package should be installed locally, e.g. \`$ npm install --save noth\``)
  }

  // Checks if the server attribute is express.js server instance
  if (typeof server !== 'function' || server.name !== 'app') {
    throw new WrongUsageError(`Noth: Wrong usage! Try 
    \`var express = require('express');
      var noth = require('noth');

      var server = express();
      noth(server);\`
    `)
  }

  // Set noth additional options
  conf.nothDirName = 'noth'
  conf.nothConfDirName = `conf`
  conf.appDirPath = util.fs.getAppDir()
  conf.appNothDirPath = path.join(conf.appDirPath, conf.nothDirName)
  conf.baseConfFileName = 'base.default.js'
  conf.baseConfFilePath = util.path.resolveNothPath('./conf', conf.baseConfFileName)

  // Initialize noth
	// First check for app conf file. If it exists use only it. 
	// If not try to initialize the native modules and write
	// the app conf file with the options, that did the job.
  flow.init()
}
