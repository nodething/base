'use strict'

const R = require('ramda')

const log = require('@noth/log').instance
const util = require('@noth/util')
const conf = require('@noth/conf')
const nothModule = require('@noth/module')

const Flow = util.Flow

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
			// Create noth config folder which is app specific
			// and should contains config settings, which are required
			// for the initializing of this package, e.g. db connect,
			// static files generation, plugins settings files, etc.
			conf.generateAppConf(type)
		}
	},

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

exports.init = (cb) => {
	// Create new flow
	const flow = new Flow()

	// Check for app noth dir and app noth conf dir  
	flow.addStep({ handler: init.createAppNothDir, cond: !util.fs.hasDirSync(conf.appNothDirPath) })
	flow.addStep({ handler: init.createAppNothConfDir, cond: !util.fs.hasDirSync(conf.appNothConfDirPath) })

	// Initialize base modules
	flow.addStep({ handler: init.loadModules('base'), failOnError: true })

	// Generate app noth config if not exists
	flow.addStep({ handler: init.generateAppConf('base'), cond: !conf.isAppNothConfFileExists('base') })

	// flow.addStep({handler: init.wait(5)})

	// Start the flow
	flow.rush((err) => {
		if(err) {
			return cb(err)
		}

		cb()
	})
}

