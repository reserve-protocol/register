module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:cypress/recommended',
    'airbnb',
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
  plugins: ['react', 'cypress', '@typescript-eslint', 'prettier'],
  rules: {
    semi: ['error', 'never'],
    'prettier/prettier': 'error',
    // In react 17, you don't need these rules
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    // Allow export default from
    'import/prefer-default-export': 'off',
    // Allow js extension for react components
    // 'react/jsx-filename-extension': [1, { extensions: ['.js', '.ts', 'tsx'] }],
    'import/no-extraneous-dependencies': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-restricted-syntax': 0,
  },
}
