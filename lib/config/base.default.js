'use strict'

Object.defineProperties(exports, {
  'db': {
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
    enumerable: true
  }
})
