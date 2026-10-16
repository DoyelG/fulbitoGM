'use strict'

const tsParser = require('@typescript-eslint/parser')
const fulbito = require('@fulbito/eslint-config')

module.exports = [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
  },
  ...fulbito.configs.recommended,
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
]
