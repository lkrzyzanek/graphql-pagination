import js from "@eslint/js";
import jest from "eslint-plugin-jest";
import globals from "globals";

export default [
    {
        ignores: ["**/dist/**/*", "jest.config.js"],
    },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.commonjs,
                ...globals.es2021,
                ...globals.node,
            },
        },
        rules: {
            "indent": ["warn", 4, { "SwitchCase": 1 }],
            "semi": ["error", "always"],
            "object-curly-spacing": ["error", "always"],
            "eol-last": ["error", "always"],
            "no-console": "warn",
            "no-unused-vars": "warn",
            "no-var": "error",
            "no-trailing-spaces": "error",
            "no-undef-init": "error",
            "no-underscore-dangle": "off",
            "no-unused-expressions": "error",
            "no-unused-labels": "error",
            "prefer-const": "error",
            "comma-dangle": ["error", "always-multiline"],
            "space-in-parens": ["warn", "never"],
            "keyword-spacing": ["warn", { "after": true, "before": true }],
            "quotes": [
                "error",
                "double",
                {
                    "avoidEscape": true,
                },
            ],
        },
    },
    {
        files: ["**/__tests__/**"],
        plugins: { jest },
        languageOptions: {
            globals: globals.jest,
        },
        rules: {
            "no-unused-expressions": "off",
            "no-undef": "off",
        },
    },
    {
        files: ["examples/**"],
        rules: {
            "no-console": "off",
        },
    },
];
