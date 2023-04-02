module.exports = {
  'env': {
    'browser': false,
    'es2019': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  'overrides': [
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    '@typescript-eslint',
    'functional'
  ],
  'rules': {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        'argsIgnorePattern': '^_',
        'destructuredArrayIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
      }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'no-constant-condition': [
      'error',
      { 'checkLoops': false },
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
    'functional/immutable-data': 'error',
    'functional/no-let': 'error',
    'functional/prefer-tacit': 'error',
    'import/order': 'error',
    'no-param-reassign': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
  },
  'settings': {
    'import/resolver': {
      typescript: true,
      node: true,
    }
  }
};
