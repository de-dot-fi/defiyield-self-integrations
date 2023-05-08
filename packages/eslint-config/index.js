module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "sonarjs"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:sonarjs/recommended",
  ],
  rules: {
    eqeqeq: ["error", "smart"],
    "no-console": ["error"],
    "sonarjs/cognitive-complexity": ["error", 16]
  },
};
