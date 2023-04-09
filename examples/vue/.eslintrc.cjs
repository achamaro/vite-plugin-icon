module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    "vue/setup-compiler-macros": true,
  },
  plugins: ["@typescript-eslint", "simple-import-sort", "unused-imports"],
  extends: ["plugin:@typescript-eslint/recommended", "plugin:vue/vue3-recommended","prettier"],
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  rules: {
    "simple-import-sort/imports": "error",
    "unused-imports/no-unused-imports": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
  },
};
