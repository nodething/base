'use strict'

const path = require('path')
const detectInstalled = require('detect-installed')

exports.isPkgLocal = () => {
	// Checks if this package is installed locally regarding the app
	return detectInstalled.sync(global.pkgName, { local: true })
}

exports.getAppRootDir = function () {
	// Get current directory name
	const pathArr = __dirname.split(path.sep)

	// These are dir names which are relative to the app root folder
	const pkgRelPath = ['node_modules', global.pkgName, 'lib']

	// Return the root path, i.e. iterate over dirnames from
	// the current dir in direction of the app root dir and
	// when it decided that it's reached the app root dir
	// returns this rest part of the path which is not part
	// of this package relative path
	for (var i = pathArr.length - 1; i >= 0; i--) {
		if(pkgRelPath.indexOf(pathArr[i]) === -1) {
			return pathArr.slice(0, i + 1).join(path.sep)
		}
	}
}
