'use strict'

const R = require('ramda')

Object.defineProperties(exports, {
  // Noth database connection settings
  db: {
    value: {
      default: {
        type: 'mongo',
        conn: process.env.MONGO_CONN || 'mongodb://127.0.0.1:27017'
      },
      alt: [{
        type: 'mysql',
        conn: {
          host: process.env.MYSQL_HOST || '127.0.0.1',
          user: process.env.MYSQL_USER || 'nodething',
          password: process.env.MYSQL_PASS || 'secret',
          database: process.env.MYSQL_DB || 'nodething'
        }
      }],
      required: true
    },
    writable: false,
    enumerable: true,
    configurable: false
  },

  // Noth front-end serve settings
  serve: {
    value: {
      default: {
        type: 'vue'
      },
      required: true
    },
    writable: false,
    enumerable: true,
    configurable: false
  },

  // Returns the default config properties
  defaultConfig: {
    writable: false,
    enumerable: false,
    configurable: false,
    value: function () {
      const confObj = R.reduce((res, key) => {
        res[key] = this[key].default
        return res
      }, {}, R.keys(this))

      return JSON.stringify(confObj, null, 2)
    }
  }
})
