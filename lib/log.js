'use strict'

const winston = require('winston')
winston.level = 'debug'

const NOTH_LOG_KEY = Symbol.for("noth-log");

const globalSymbols = Object.getOwnPropertySymbols(global);
const hasNothLog = (globalSymbols.indexOf(NOTH_LOG_KEY) > -1);

if (!hasNothLog) {
	global[NOTH_LOG_KEY] = winston.log
}

const singleton = {};

Object.defineProperty(singleton, "instance", {
	get: function () {
		return global[NOTH_LOG_KEY];
	}
});

Object.freeze(singleton);

// True singleton - ES6 + Symbols
module.exports = singleton;