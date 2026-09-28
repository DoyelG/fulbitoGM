'use strict'

const fulbito = require('./src/index.js')

module.exports = [
  ...fulbito.configs.recommended,
  {
    ignores: ['node_modules/**'],
  },
]
