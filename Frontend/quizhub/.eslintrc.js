module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'react-app',
        'react-app/jest'
      ]
    }
  ]
};