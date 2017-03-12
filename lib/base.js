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

	// Checks if the server attribute is express.js server instance
	if(typeof server !== 'function' || server.name !== 'app') {
		throw new Error(`Wrong usage! Try \`const express = require('express')
			 const nt = require('nodething')
			 const server = express()
			 nt(server)\``)
	}
}
