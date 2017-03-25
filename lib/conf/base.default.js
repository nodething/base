'use strict'

const R = require('ramda')

const util = require('@noth/util')

Object.defineProperties(exports, {
  // Noth database connection settings
  db: Object.assign({
    value: {
      default: {
        type: 'mongo',
        conn: process.env.MONGO_CONN || 'mongodb://127.0.0.1:27017'
      },
      alt: [{
        type: 'mysql',
        conn: {
          host: process.env.MYSQL_HOST || '127.0.0.1',
          user: process.env.MYSQL_USER || 'noth',
          password: process.env.MYSQL_PASS || 'secret',
          database: process.env.MYSQL_DB || 'noth'
        }
      }],
      // required: false means that it's not required that
      // this config should exists in the main app noth config
      // and in such a case the noth will use the default config
      // for the specific plugin
      required: true
    }
  }, util.obj.propConfOption),

  // Noth front-end serve settings
  serve: Object.assign({
    value: {
      default: {
        type: 'vue'
      },
      required: true
    }
  }, util.obj.propConfOption),

  // TODO: check is module required
})
