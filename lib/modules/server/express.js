'use strict'

const WrongUsageError = require('@noth/error').WrongUsageError

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
