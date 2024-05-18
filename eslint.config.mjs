import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node, // Add Node.js globals
    },
    plugins: {
      jest: jest,
    },
    rules: {
      // Custom rules here
    },
  },
  {
    files: ["**/*.test.js"],
    languageOptions: {
      globals: {
        ...globals.jest, // Add Jest globals for test files
        ...globals.node, // Include Node.js globals in test files
      },
    },
    rules: {
      "no-unused-vars": "off", // Turn off no-unused-vars for test files
    },
  },
  pluginJs.configs.recommended,
];
