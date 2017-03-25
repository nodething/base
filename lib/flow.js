'use strict'

const R = require('ramda')

const log = require('@noth/log').instance
const util = require('@noth/util')
const conf = require('@noth/conf')
const nothModule = require('@noth/module')

const Flow = util.Flow

// Init flow steps handlers
const init = {
	// Creates `{appPath}/noth` folder if not exists
	createAppNothDir: () => {
		util.fs.createDirSync(conf.appNothDirPath)
	},

	// Creates `{appPath}/noth/conf` folder if not exists
	// Creates app folder which will be used by noth
	// for confuration files
	createAppNothConfDir: () => {
		util.fs.createDirSync(conf.appNothConfDirPath)
	},

	loadModules: (type) => {
		return () => {
			return new Promise((resolve, reject) => {
				// Load native noth modules
				const modulesNames = util.pkg.getModulesNames(conf.getNothConfFile(type))
				const nothModules = R.map((name) => nothModule.init(type, name), modulesNames)

				Promise.all(nothModules)
					.then((nothModules) => {
						log('debug', 'noth: native modules loading: completed')
						resolve()
					})
					.catch((err) => {
						reject(err)
					})
			})
		}
	},

	generateAppConf: (type) => {
		return () => {
			// Create noth conf folder which is app specific
			// and should contains conf settings, which are required
			// for the initializing of this package, e.g. db connect,
			// static files generation, plugins settings files, etc.
			conf.generateAppConf(type)
		}
	},

	loadPlugins: () => {
		return () => {
			return new Promise((resolve, reject) => {

			})
		}
	},

	// Wait specific amount of setTimeout
	// Delay the noth loading
	// Use only with debug purposes
	wait: (sec) => {
		return () => {
			return new Promise((resolve) => {
				setTimeout(() => {
					resolve()
				}, sec * 1000)
			})
		}
	}
}

// Main noth init flow
exports.init = (cb) => {
	return new Promise((resolve, reject) => {
		// Create new flow
		const flow = new Flow()

		// Check for app noth dir and app noth conf dir  
		flow.addStep({ handler: init.createAppNothDir, cond: !util.fs.hasDirSync(conf.appNothDirPath) })
		flow.addStep({ handler: init.createAppNothConfDir, cond: !util.fs.hasDirSync(conf.appNothConfDirPath) })

		// Initialize base modules
		flow.addStep({ handler: init.loadModules('base'), failOnError: true })

		// Generate app noth conf if not exists
		flow.addStep({ handler: init.generateAppConf('base'), cond: !conf.isAppNothConfFileExists('base') })

		// Initialize plugins
		flow.addStep({ handler: init.loadPlugins(), failOnError: true })

		// Generate app noth conf if not exists
		flow.addStep({ handler: init.generateAppConf('plugins'), cond: !conf.isAppNothConfFileExists('plugins') })

		// flow.addStep({handler: init.wait(5)})

		// Start the flow
		flow.rush((err) => {
			if (err) {
				return reject(err)
			}

			resolve()
		})
	})
}
