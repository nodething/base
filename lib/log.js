'use strict'

const debug = require('debug')
const debugLog = debug('noth:debug')
const errorLog = debug('noth:error')

const msgHandlers = {
	error: errorLog,
	debug: debugLog
}
const log = debugLog

const NOTH_LOG_KEY = Symbol.for("noth-log")

const globalSymbols = Object.getOwnPropertySymbols(global)
const hasNothLog = (globalSymbols.indexOf(NOTH_LOG_KEY) > -1)

if (!hasNothLog) {
	// Singleton fn handler
	global[NOTH_LOG_KEY] = (type, msg, err) => {
		if (msgHandlers[type]) {
			msgHandlers[type](msg, err ? err : '')
		} else {
			log(msg)
		}
	}
}

const singleton = {}

Object.defineProperty(singleton, "instance", {
	get: function () {
		return global[NOTH_LOG_KEY]
	}
});

Object.freeze(singleton)

// True singleton - ES6 + Symbols
module.exports = singleton
