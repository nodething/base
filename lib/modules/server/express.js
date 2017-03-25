'use strict'

const conf = require('@noth/conf')
const WrongUsageError = require('@noth/error').WrongUsageError

// Validate if the server instance is express app
exports.validate = (instance) => {
	if (typeof instance !== 'function' || instance.name !== 'app') {
		throw new WrongUsageError(`Noth: Wrong usage! Try 
    \`var express = require('express');
      var noth = require('noth');

      var server = express();
      noth(server);\`
    `)
	}
}

exports.handleReqByStatus = (status, instance) => {
	instance.use((req, res, next) => {
		if(conf.status !== status) {
			return next()
		}

		res.send('Loading... Please refresh after 5 seconds!')
	})
}
