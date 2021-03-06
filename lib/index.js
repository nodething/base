'use strict'

const path = require('path')

const util = require('@noth/util')
const conf = require('@noth/conf')
const log = require('@noth/log').instance
const WrongUsageError = require('@noth/error').WrongUsageError
const FlowError = require('@noth/error').FlowError
const flow = require('@noth/flow')

// Default exports
module.exports = base

/**
 * Base function
 * 
 * @param {*} instance server instance
 * @param {Object} options noth options
 */
function base(instance, options) {
  // Set noth options
  conf.status = conf.STATUSES.IDLE
  conf.pkgName = 'noth'

  // Validate if the package is installed locally
  // and throw exception if it's installed globally
  if (!util.pkg.isLocal(conf.pkgName)) {
    throw new WrongUsageError(`Noth: The "${conf.pkgName}" package should be installed locally, e.g. \`$ npm install --save noth\``)
  }

  // Set noth additional options
  conf.server = require('@nothModules/server/express')(instance)
  conf.nodeEnv = process.env.NODE_ENV || 'production'
  conf.nothDirName = 'noth'
  conf.nothConfDirName = `conf`
  conf.appDirPath = util.fs.getAppDir()
  conf.appNothDirPath = path.join(conf.appDirPath, conf.nothDirName)
  conf.baseConfFileName = 'base.default.js'
  conf.baseConfFilePath = util.path.resolveNothPath('./conf', conf.baseConfFileName)

  // Loading...
  conf.status = conf.STATUSES.LOADING
  // Show loading message if someone is trying
  // to reach an server endpoint during the noth loading
  conf.server.handleReqByStatus(conf.status)

  // Initialize noth
  // First check for app conf file. If it exists use only it. 
  // If not try to initialize the native modules and write
  // the app conf file with the options, that did the job.
  flow.init()
    .then(() => {
      conf.status = conf.STATUSES.READY

      // Noth is loaded
      log('debug', 'noth: loaded')
    })
    .catch((err) => {
      conf.status = conf.STATUSES.ERROR

      // Break the app: throws error
      throw new FlowError(err)
    })
}
