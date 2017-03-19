'use strict'

const path = require('path')
const detectInstalled = require('detect-installed')
const fs = require('fs')
const appRootDir = require('app-root-dir')

const config = require('@noth/config')

exports.isPkgLocal = () => {
  // Checks if this package is installed locally regarding the app
  return detectInstalled.sync(config.pkgName, { local: true })
}

exports.getAppDir = function () {
  return appRootDir.get()
}

/**
 * Checks if the directory exists - synchronously
 * @param {*} path 
 */
exports.hasDirSync = (path) => {
  return fs.existsSync(path)
}

/**
 * Returns array of filenames in the specific dir - synchronously
 * @param {*} path 
 */
exports.getFilesSync = (path) => {
  return fs.readdirSync(path)
}

/**
 * Mkdir - synchronously
 * @param {*} path 
 */
exports.createDirSync = (path) => {
  return fs.mkdirSync(path)
}

/**
 * Creates a file - synchronously
 * @param {*} path 
 * @param {*} text 
 */
exports.createFileSync = (path, text) => {
  return fs.writeFileSync(path, text)
}

/**
 * Resolve a path which is relative of the nodething pkg directory
 * @param {Array} args 
 */
exports.resolveNothPath = (...args) => {
  return path.resolve.apply(null, [__dirname, ...args])
}

/**
 * Generates js module file contains noth base or  
 * noth plugin config settings
 * @param {Object} module 
 */
exports.generateConfigTxt = (module) => {
  return `'use strict'

module.exports = ${module.defaultConfig()}
  `
}
