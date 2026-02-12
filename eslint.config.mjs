import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import boundariesPlugin from 'eslint-plugin-boundaries';
import globals from 'globals';

export default defineConfig([
    // Base JS config
    js.configs.recommended,
    // TypeScript configs
    ...tseslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],

    {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...Object.fromEntries(Object.entries(globals.browser).filter(([key]) => key.trim() === key)),
                ...Object.fromEntries(Object.entries(globals.node).filter(([key]) => key.trim() === key)),
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            prettier: prettierPlugin,
            import: importPlugin,
            boundaries: boundariesPlugin,
        },
        settings: {
            react: {
                version: 'detect',
            },
            'import/resolver': {
                node: {
                    extensions: ['.js', '.jsx', '.ts', '.tsx'],
                    moduleDirectory: ['node_modules', 'src/', 'automation-tests/'],
                },
            },
            'boundaries/elements': [
                {
                    type: 'automation-tests',
                    pattern: 'automation-tests/**',
                },
                {
                    type: 'app',
                    pattern: 'src/**',
                },
            ],
        },
        ignores: ['**/*.json'],

        rules: {
            /***** React Hooks Recommended + React Compiler rules *****/
            'react-hooks/rules-of-hooks': 'error', // Enforce hook rules
            'react-hooks/exhaustive-deps': 'warn', // Verify effect dependencies
            'react-hooks/config': 'error',
            'react-hooks/error-boundaries': 'error',
            'react-hooks/component-hook-factories': 'error',
            'react-hooks/gating': 'error',
            'react-hooks/globals': 'error',
            'react-hooks/immutability': 'error',
            'react-hooks/preserve-manual-memoization': 'error',
            'react-hooks/purity': 'error',
            'react-hooks/refs': 'error',
            'react-hooks/set-state-in-effect': 'off',
            'react-hooks/set-state-in-render': 'off',
            'react-hooks/static-components': 'error',
            'react-hooks/unsupported-syntax': 'warn',
            'react-hooks/use-memo': 'error',
            'react-hooks/incompatible-library': 'warn',

            /***** TypeScript & JS rules *****/
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_', // ignore unused function args starting with _
                    varsIgnorePattern: '^error$|^err$', // ignore unused variables named "error" or "err"
                    caughtErrorsIgnorePattern: '^error$|^err$', // ignore unused catch vars
                },
            ],
            'no-use-before-define': 'off',
            'no-underscore-dangle': ['error', { allowAfterThis: true }],
            'no-restricted-syntax': 'error',
            'no-await-in-loop': 'error',
            'no-nested-ternary': 'error',
            'global-require': 'error',
            'consistent-return': 'error',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-empty-function': 'error',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-shadow': ['error'],
            '@typescript-eslint/no-redeclare': ['error'],
            '@typescript-eslint/no-empty-object-type': 'error',
            '@typescript-eslint/no-require-imports': 'error',
            'no-console': 'error',
            'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state'] }],
            'no-shadow': 'off',
            'no-redeclare': 'off',
            radix: 0,
            indent: 0,
            'linebreak-style': 0,

            /***** React rules *****/
            'react/prop-types': 'off',
            'react/require-default-props': 'off',
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/no-array-index-key': 'error',
            'react/jsx-no-useless-fragment': 'error',
            'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
            'react/display-name': 'off',
            'react/jsx-indent': 0,
            'react/function-component-definition': [
                'error',
                {
                    namedComponents: 'arrow-function',
                    unnamedComponents: 'arrow-function',
                },
            ],
            'react/no-unstable-nested-components': [
                'warn',
                {
                    allowAsProps: true,
                },
            ],

            /***** Import rules *****/
            'import/extensions': 0,
            'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            'import/prefer-default-export': 0,

            /***** Prettier rules *****/
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                },
            ],

            'func-names': 'off',

            'boundaries/element-types': [
                'error',
                {
                    default: 'allow',
                    rules: [
                        {
                            from: 'automation-tests',
                            disallow: ['app'],
                        },
                        {
                            from: 'app',
                            disallow: ['automation-tests'],
                        },
                    ],
                },
            ],
        },
    },
]);
