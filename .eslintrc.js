module.exports = {
  env: {
    commonjs: true,
    es2021: true
  },
  extends: 'standard',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    semi: [2, 'always'],
    indent: 'off',
    'no-unused-vars': ['error', { vars: 'local', args: 'after-used', ignoreRestSiblings: false }]
  }
};
