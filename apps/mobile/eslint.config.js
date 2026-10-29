const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const fulbito = require('@fulbito/eslint-config');

module.exports = defineConfig([
  expoConfig,
  ...fulbito.configs.recommended,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  {
    ignores: ['dist/*', '.expo/**', 'expo-env.d.ts'],
  },
]);
