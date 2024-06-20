const config = require('@chubbyts/chubbyts-eslint/dist/eslintrc').default;

module.exports = {
  ...config,
  parserOptions: {
    ...config.parserOptions,
    project: './tsconfig.eslint.json',
  },
};
