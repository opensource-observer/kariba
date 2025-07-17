
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

//module.exports = defineConfig([{
export default defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },

            tsconfigRootDir: __dirname,
            project: "./tsconfig.json",
        },
    },

    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "prettier",
    ),

    plugins: {
        "@typescript-eslint": typescriptEslint,
        react,
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-object-type": "off",
        "@typescript-eslint/no-unused-expressions": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            argsIgnorePattern: "^_",
        }],

        "no-restricted-properties": ["error", {
            object: "console",
            property: "error",
            message: "Please use the logger instead.",
        }],

        "no-restricted-globals": ["error", {
            name: "prompt",
            message: "Please use a React modal instead.",
        }],
    },
}, globalIgnores([
    "**/vendor/*.js",
    "vendor/**/*.js",
    "**/jest.config.ts",
    "**/test.only/**/*",
    "**/utilities/**/*",
    "**/.eslintrc.js",
    "**/postcss.config.js",
])]);
