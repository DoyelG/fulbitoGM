const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const fulbito = require('@fulbito/eslint-config');

module.exports = defineConfig([
  expoConfig,
  ...fulbito.configs.recommended,
  {
    ignores: ['dist/*', '.expo/**', 'expo-env.d.ts'],
  },
]);
