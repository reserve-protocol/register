module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
  },
  settings: {
    'import/resolver': {
      node: {
        paths: ['./src'],
      },
    },
  },
  ignorePatterns: ['node_modules/**/*'],
  extends: [
    'plugin:react/recommended',
    'plugin:cypress/recommended',
    'airbnb',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'cypress', '@typescript-eslint', 'prettier', 'jest'],
  rules: {
    semi: ['error', 'never'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'prettier/prettier': 'error',
    // In react 17, you don't need these rules
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'no-use-before-define': 'off',
    'no-await-in-loop': 'off',
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'react/require-default-props': 0,
    '@typescript-eslint/no-use-before-define': ['error'],
    // Allow export default from
    'import/prefer-default-export': 'off',
    // Allow js extension for react components
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.ts', 'tsx'] }],
    'import/no-extraneous-dependencies': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-restricted-syntax': 0,
    'no-unused-vars': 0,
    'consistent-return': 0,
  },
}
