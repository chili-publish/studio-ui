module.exports = {
    parser: '@typescript-eslint/parser',
    env: {
        browser: true,
        es2021: true,
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                moduleDirectory: ['node_modules', 'src/', '_modules/'],
            },
        },
    },
    ignorePatterns: ['**/*.json'],
    extends: [
        'airbnb',
        'airbnb/hooks',
        'airbnb-typescript',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:prettier/recommended', // should be at the last
    ],
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
        },
    },
    plugins: ['react', 'prettier'],
    rules: {
        'no-unused-vars': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/no-var-requires': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        indent: 0,
        'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
                singleQuote: true,
            },
        ],
        'react/jsx-indent': 0,
        'import/extensions': 0,
        'linebreak-style': 0,
        'no-console': 'error',
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'import/prefer-default-export': 0,
        'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state'] }],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        radix: 0,
    },
};
