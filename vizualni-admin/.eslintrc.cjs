module.exports = {
  extends: [
    'eslint:recommended'
  ],
  env: {
    browser: true,
    es2022: true,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off', // Turned off for TypeScript compatibility
    'no-console': 'warn'
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js', '*.config.ts', '**/*.test.ts', '**/*.test.tsx']
};