import globals from 'globals';
import takiyonConfig from 'eslint-config-takiyon';

import webpackConfig from './webpack.config.test.js';

export default [
    ...takiyonConfig,
    {
        files: [
            '**/*.{js,jsx}',
        ],
        ignores: ['./node_modules/**/*'],
        settings: {
            // Account for webpack.resolve.module imports
            'import/resolver': {
                // Fixes Node resolution issues in ESLint v6
                // https://github.com/benmosher/eslint-plugin-import/issues/1396
                node: {},
                webpack: {
                    config: webpackConfig,
                },
            },
        },
    },
    {
        // Front-end files
        files: [
            'examples/**/*.js',
            'src/**/*.js',
            'test/**/*.js',
        ],
        languageOptions: {
            globals: {
                APP_NAME: 'readonly',
                ...globals.browser,
            },
        },
    },
    {
        // Test files
        files: ['test/**/*.js'],
        languageOptions: {
            globals: {
                APP_NAME: 'readonly',
                ...globals.mocha,
            },
        },
    },
    {
        // Build files
        files: ['*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
];
