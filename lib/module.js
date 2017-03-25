'use strict'

const async = require('async')

const util = require('@noth/util')
const conf = require('@noth/conf')
const log = require('@noth/log').instance

const initModule = exports.init = (type, name, options, alt) => {
	return new Promise((resolve, reject) => {
		options = options || conf.getConfFromFile({ type, name })
		const subtype = options.type
		let nothModule

		/**
		 * Promise resolve/reject handler
		 * 
		 * @param {*} err 
		 * @param {*} result 
		 */
		function next(err, result) {
			if (err) {
				// TODO: throw exp if the module was required
				log('error', err)

				return resolve()
			}

			resolve(result)
		}

		try {
			nothModule = require(`@noth/modules/${name}/${subtype}`)
		} catch (e) {
			log('error', err)
			next(`noth: can't find submodule: wrong conf options: ${name} -> ${subtype}`)
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
				.then((result) => {
					if (!hasPreInitHook) {
						return Promise.resolve(result)
					}

					return nothModule.init(options)
				})
				.then((result) => {
					log('debug', `noth: module initialized: ${subtype} -> ${name}`)

					// Save the conf options
					!conf[type] && (conf[type] = {})
					conf[type][name] = options

					// The module is initialized
					next(null, result)
				})
				.catch((err) => {
					log('error', err)

					if (!alt && !conf.isAppNothConfFileExists(type)) {
						// Try to load alternative submodule if the default could not load
						tryUseAltConf(type, name, next)
					} else {
						// Resolve the promise even if it can't load the submodule
						next(`noth: can't load submodule: ${name} -> ${subtype}`)
					}
				})
		} else {
			// Resolve the promise even if it can't find the submodule
			next(`noth: can't find submodule: ${name} -> ${subtype}`)
		}
	})
}

/**
 * Try to load the module with alternative conf if exists
 * 
 * @param {string} name 
 * @param {Function} next 
 */
function tryUseAltConf(type, name, next) {
	const altConf = conf.getConfFromFile({ type, name, alt: true })

	if (!altConf) {
		return next(`noth: can't load module: ${name}`)
	}

	var result

	// Try to load some submodule with an alternative conf
	async.some(altConf, (altConf, callback) => {
		initModule(type, name, altConf, true)
			.then((initialized) => {
				if (initialized) {
					// Keep the initialized module
					result = initialized

					// Return the initialized module
					return callback(null, true)
				}

				// Try to load another submodule with another alternative conf
				callback(null, false)
			})
			.catch(() => {
				// Try to load another submodule with another alternative conf
				callback(null, false)
			})
	}, function (err) {
		if (err) {
			return next(`noth: can't load submodule: ${name}`)
		}

		// The module has been initialized with alternative conf
		next(null, result)
	})
}
