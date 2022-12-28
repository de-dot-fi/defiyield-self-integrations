module.exports = {
  root: true,
  env: { node: true },
  extends: ['@defiyield'],
  rules: {
    'no-empty': ['error', { 'allowEmptyCatch': true }],
  },
};
