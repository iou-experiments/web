module.exports = {
  extends: ['react-app', 'react-app/jest'],
  env: {
    es2021: true,
    worker: true,
  },
  globals: {
    globalThis: 'readonly',
  },
  rules: {
    'no-restricted-globals': 'off',
  },
};