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
 * 
 * @param {*} path 
 */
exports.hasDirSync = (path) => {
  return fs.existsSync(path)
}

/**
 * 
 * @param {*} path 
 */
exports.getFilesSync = (path) => {
  return fs.readdirSync(path)
}

/**
 * 
 * @param {*} path 
 */
exports.createDirSync = (path) => {
  return fs.mkdirSync(path)
}

/**
 * 
 * @param {*} path 
 * @param {*} text 
 */
exports.createFileSync = (path, text) => {
  return fs.writeFileSync(path, text)
}

/**
 * 
 * @param {Array} args 
 */
exports.resolveNothPath = (...args) => {
  return path.resolve.apply(null, [__dirname, ...args])
}

/**
 * 
 * @param {Object} module 
 */
exports.generateConfigTxt = (module) => {
  return `'use strict'
  
module.exports = ${module.defaultConfig()}
  `
}
