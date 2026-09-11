'use strict'

const noComments = require('./rules/no-comments')

const plugin = {
  meta: {
    name: '@fulbito/eslint-config',
    version: '0.0.0',
  },
  rules: {
    'no-comments': noComments,
  },
}

plugin.configs = {
  recommended: [
    {
      plugins: { fulbito: plugin },
      rules: {
        'fulbito/no-comments': 'error',
      },
    },
  ],
}

module.exports = plugin
