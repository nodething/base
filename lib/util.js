'use strict'

const path = require('path')
const detectInstalled = require('detect-installed')
const fs = require('fs')
const config = require('./config')

exports.isPkgLocal = () => {
  // Checks if this package is installed locally regarding the app
  return detectInstalled.sync(config.pkgName, { local: true })
}

exports.getAppDir = function () {
  // Get current directory name
  const pathArr = __dirname.split(path.sep)

  // These are dir names which are relative to the app folder
  const pkgRelPath = ['node_modules', config.pkgName, 'lib']

  // Return the app dir path, i.e. iterate over dirnames from
  // the current dir in direction of the app dir and
  // when it decided that it's reached the app dir
  // returns this rest part of the path which is not part
  // of this package relative path
  for (var i = pathArr.length - 1; i >= 0; i--) {
    if (pkgRelPath.indexOf(pathArr[i]) === -1) {
      return pathArr.slice(0, i + 1).join(path.sep)
    }
  }
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
