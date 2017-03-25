'use strict'

const async = require('async')

const util = require('@noth/util')
const conf = require('@noth/conf')
const log = require('@noth/log').instance

const initModule = exports.init = (type, name) => {
	return new Promise((resolve, reject) => {
		let defaultConf = conf.getConfFromFile({ type, name })

		loadModule(type, name, defaultConf)
			.then(resolve)
			.catch((err) => {
				log('error', err)

				// If the module is reuired in order to noth
				// can work properly
				let isModuleRequired = conf.isConfOptionRequired({ type, name })

				// If app noth conf file exists and the current module is 
				// required reject the promise
				if(conf.isAppNothConfFileExists(type) && isModuleRequired) {
					return reject(`Noth: Wrong or missing conf option: ${name}`)
				}

				// Get the alternative config options
				const altConfs = conf.getConfFromFile({ type, name, alt: true })

				// If there isn't alternative conf and the module is 
				// required reject the promise
				if (!altConfs && isModuleRequired) {
					return reject(`Noth: Wrong or missing conf option: ${name}`)
				}

				// Try to load some submodule with an alternative conf
				let loadedModule
				async.some(altConfs, (altConf, callback) => {
					loadModule(type, name, altConf)
						.then((result) => {
							if (result) {
								// Keep the loaded module
								loadedModule = result

								// Return the initialized module
								return callback(null, true)
							}

							// Try to load another submodule with another alternative conf
							callback(null, false)
						})
						.catch((err) => {
							log('error', err)
							// Try to load another submodule with another alternative conf
							callback(null, false)
						})
				}, function (err) {
					if (!loadedModule && isModuleRequired) {
						return reject(`noth: can't load submodule: ${name}`)
					}

					// The module has been initialized with alternative conf
					resolve(loadedModule)
				})
			})
	})
}

function loadModule(type, name, options) {
	return new Promise((resolve, reject) => {
		const subtype = options.type
		let nothModule

		try {
			nothModule = require(`@nothModules/${name}/${subtype}`)
		} catch (err) {
			return reject(`noth: can't find submodule: wrong conf options: ${name} -> ${subtype}`)
		}

		if (nothModule) {
			var startFn = nothModule.init
			const hasPreInitHook = typeof nothModule.pre === 'function'

			if (hasPreInitHook) {
				// Start with the pre hook
				startFn = nothModule.pre
			}

			// Init the submodule
			startFn(options)
				.then((loadedModule) => {
					if (!hasPreInitHook) {
						return Promise.resolve(loadedModule)
					}

					return nothModule.init(options)
				})
				.then((loadedModule) => {
					log('debug', `noth: module initialized: ${subtype} -> ${name}`)

					// Save the conf options
					!conf[type] && (conf[type] = {})
					conf[type][name] = options

					// The module is initialized
					resolve(loadedModule)
				})
				.catch(reject)
		} else {
			// Reject the promise if it can't find the submodule
			reject(`noth: can't find submodule: ${name} -> ${subtype}`)
		}
	})
}
