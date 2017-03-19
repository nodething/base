'use strict'

require('module-alias/register')

module.exports = function (server, options) {
  return require('@noth')(server, options)
}
