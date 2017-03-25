'use strict'

const conf = require('@noth/conf')
const WrongUsageError = require('@noth/error').WrongUsageError

class ExpressServer {
	constructor(instance) {
		this.instance = instance

		// Validate if the instance attribute is express.js server instance
		this.validate()
	}

	// Validate if the server instance is express app
	validate() {
		if (typeof this.instance !== 'function' || this.instance.name !== 'app') {
			throw new WrongUsageError(`Noth: Wrong usage! Try 
    \`var express = require('express');
      var noth = require('noth');

      var server = express();
      noth(server);\`
    `)
		}
	}

	handleReqByStatus(status) {
		this.instance.use((req, res, next) => {
			if (conf.status !== status) {
				return next()
			}

			res.send('Loading... Please refresh after 5 seconds!')
		})
	}
}

module.exports = (instance) => new ExpressServer(instance)
