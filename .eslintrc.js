module.exports = {
  env: {
    jest: true,
    es6: true,
    node: true
  },
  extends: ["standard", "plugin:prettier/recommended", "plugin:node/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2015
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      {
        version: ">=16.0.0",
                ignores: ['modules'],
      }
    ]
  }
};
