'use strict'

var util = require('./util')

module.exports = function (server) {
	// Set global vars
	global.pkgName = 'nodething'
	
	// Check if the package is installed locally
	// Throw exception if it's installed globally
	if (!util.isPkgLocal()) {
		throw new Error(`The "${global.pkgName}" package should be installed locally, e.g. \`$ npm i -E nodething\``)
	}
}
