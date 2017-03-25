'use strict'

exports.init = (options) => {
	return new Promise((resolve, reject) => {
		resolve({
			name: 'mysql'
		})
		// reject('MySQL error!')
	})
}