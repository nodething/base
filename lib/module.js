'use strict'

const async = require('async')

const util = require('@noth/util')
const config = require('@noth/config')
const log = require('@noth/log').instance

const initModule = exports.init = (name, conf, alt) => {
	return new Promise((resolve, reject) => {
		const options = conf || config[name]
		const type = options.type

		const nothModule = requireModule(name, type)

		if (nothModule) {

			/**
			 * Promise resolve/reject handler
			 * 
			 * @param {*} err 
			 * @param {*} result 
			 */
			function next(err, result) {
				if (err) {
					log('error', err)

					return resolve()
				}

				resolve(result)
			}

			var startFn = nothModule.init
			const hasPreInitHook = typeof nothModule.pre === 'function'

			if (hasPreInitHook) {
				// Start with the pre hook
				startFn = nothModule.pre
			}

			// Init the native submodule
			startFn(options)
				.then((result) => {
					if (!hasPreInitHook) {
						return Promise.resolve(result)
					}

					return nothModule.init(options)
				})
				.then((result) => {
					log('debug', `noth: native module initialized: ${type} -> ${name}`)
					// The module is initialized
					next(null, result)
				})
				.catch((err) => {
					log('error', err)

					if (!alt) {
						// Try to load alternative submodule if the default could not load
						tryUseAltConf(name, next)
					} else {
						// Resolve the promise even if it can't load the submodule
						next(`noth: can't load native submodule: ${name} -> {type}`)
					}
				})
		} else {
			// Resolve the promise even if it can't find the submodule
			next(`noth: can't find native submodule: ${name} -> {type}`)
		}
	})
}

/**
 * Try to load the module with alternative config if exists
 * 
 * @param {string} name 
 * @param {Function} next 
 */
function tryUseAltConf(name, next) {
	const altConf = config.getConfigOptions('base', name, true)

	if (!altConf) {
		return next(`noth: can't load native module: ${name}`)
	}

	var result

	async.some(altConf, (altConf, callback) => {
		initModule(name, altConf, true)
			.then((initialized) => {
				if (initialized) {
					// Keep the initialized module
					result = initialized

					// Return the initialized module
					return callback(null, true)
				}

				// Try to load another submodule with another alternative config
				callback(null, false)
			})
			.catch(() => {
				// Try to load another submodule with another alternative config
				callback(null, false)
			})
	}, function (err) {
		if (err) {
			return next(`noth: can't load native submodule: ${name}`)
		}

		// The module has been initialized with alternative config
		next(null, result)
	})
}

/**
 * Requires native noth module, i.e. db, serve
 * 
 * @param {*} name 
 * @param {*} type 
 */
function requireModule(name, type) {
	var module

	try {
		module = require(`@noth/${name}/${type}`)
	} catch (err) {
		log('error', `noth: can't find native submodule: wrong config options: ${name} -> {type}`, err)
	}

	return module
}
