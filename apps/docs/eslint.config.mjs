import path from "node:path";
import { fileURLToPath } from "node:url";
//import js from "@eslint/js";
//import { FlatCompat } from "@eslint/eslintrc";
import { includeIgnoreFile } from "@eslint/compat";
import baseConfig from "../../eslint.config.mjs";

// eslint-disable-next-line
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");
/**
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});
*/

export default [
    includeIgnoreFile(gitignorePath),
    {
        ignores: [
            "node_modules",
            "src/components/plasmic/generated/",
            "static/plasmic/",
            "build",
            "**/.docusaurus",
            "**/.cache-loader",
            "**/.DS_Store",
            "**/.env.local",
            "**/.env.development.local",
            "**/.env.test.local",
            "**/.env.production.local",
            "**/npm-debug.log*",
            "**/yarn-debug.log*",
            "**/yarn-error.log*",
        ],
    }, ...baseConfig, {
        languageOptions: {
            ecmaVersion: 5,
            sourceType: "script",

            parserOptions: {
                project: ["./apps/docs/tsconfig.json"],
            },
        },

        rules: {
            "@typescript-eslint/ban-ts-comment": "off",
        },
    }
];