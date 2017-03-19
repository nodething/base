'use strict'

require('module-alias/register')

module.exports = function (server) {
  return require('@noth')(server)
}
