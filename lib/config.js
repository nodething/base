'use strict'

const path = require('path')
const util = require('./util')

const pkgDefaultConfigProps = ['pkgName', 'rootDir']

const config = Object.create(null)

Object.defineProperty(config, 'hasAppConfigSync', {
  configurable: false,
	enumerable: false,
  get: () => {
    if (!config.rootDir) {
      throw new Error('Nodething: Missing path - app root folder')
    }

    return util.hasDirSync(path.join(config.rootDir, 'nt'))
  }
})

config.generateAppConfig = () => {
  // TODO: generate app config
}

module.exports = config
