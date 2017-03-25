'use strict'

const path = require('path')
const detectInstalled = require('detect-installed')
const fs = require('fs')
const appRootDir = require('app-root-dir')

const log = require('@noth/log').instance

// Noth package utils
exports.pkg = {
  // Checks if this package is installed locally regarding the app
  isLocal: (pkgName) => {
    return detectInstalled.sync(pkgName, { local: true })
  },

  getModulesNames: (nothConfFile) => {
    return Object.keys(nothConfFile)
  }
}

// File system utils
exports.fs = {
  getAppDir: () => {
    return appRootDir.get()
  },

  // Checks if the directory exists - synchronously
  hasDirSync: (path) => {
    return fs.existsSync(path)
  },

  // Returns array of filenames in the specific dir - synchronously
  getFilesSync: (path) => {
    return fs.readdirSync(path)
  },

  // Mkdir - synchronously
  createDirSync: (path) => {
    return fs.mkdirSync(path)
  },

  // Creates a file - synchronously
  createFileSync: (path, text) => {
    return fs.writeFileSync(path, text)
  }
}

// Path utils
exports.path = {
  // Resolve a path which is relative of the noth pkg directory
  resolveNothPath: (...args) => {
    return path.resolve.apply(null, [__dirname, ...args])
  }
}

// Template utils
exports.tmpl = {
  // Generates js module file contains noth base or
  // noth plugin conf settings
  generateConfigFile: (options) => {
    return `'use strict'

module.exports = ${JSON.stringify(options, null, 2)}
  `
  }
}

// Flow class implementation
exports.Flow = class Flow {
  constructor() {
    this.steps = []
  }

  addStep(step) {
    this.steps = [...this.steps, step]
  }

  rush(cb) {
    this._next(cb)
  }

  _next(cb) {
    const step = this.steps[0]
    if (!step) {
      // Flow has finished
      return cb()
    }

    // Remove the current step from the flow
    this.steps = this.steps.slice(1)

    const _handleError = (err) => {
      if (step.failOnError === true) {
        cb(err)
      } else {
        // Silent error if step.failOnError is not true
        log('error', err)
      }
    }

    try {
      if (typeof step.cond === 'undefined' || (typeof step.cond === 'function' ? step.cond() : step.cond)) {
        var result = step.handler()

        // If the result is Promise
        if (result && result.constructor === Promise) {
          return result
            .then(() => {
              this._next(cb)
            })
            .catch(_handleError)
        }
      }

      this._next(cb)
    } catch (e) {
      _handleError(e)
    }
  }
}

// Object property options
exports.obj = {
  propValueFnOptions: {
    confurable: false,
    enumerable: false,
    writable: false
  },
  propGetOptions: {
    configurable: false,
    enumerable: false
  },
  propConfOption: {
    writable: false,
    enumerable: true,
    configurable: false
  }
}
