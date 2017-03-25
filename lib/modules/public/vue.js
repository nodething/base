'use strict'

exports.init = (options) => {
	return new Promise((resolve, reject) => {
		resolve({
			name: 'vue'
		})
		// reject('Vue error!')
	})
}