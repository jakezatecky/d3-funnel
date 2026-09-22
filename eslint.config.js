import { defineConfig } from 'eslint/config';
import takiyonConfig from 'eslint-config-takiyon';
import { createNodeResolver } from 'eslint-plugin-import-x';
import globals from 'globals';

import webpackConfig from './webpack.config.test.js';

export default defineConfig([
    takiyonConfig,
    {
        files: ['**/*.{js,jsx}'],
        settings: {
            // Account for webpack.resolve.alias imports
            'import-x/resolver-next': [
                createNodeResolver({
                    alias: Object.fromEntries(
                        Object.entries(webpackConfig.resolve.alias).map(([name, target]) => [
                            name,
                            [target],
                        ]),
                    ),
                }),
            ],
        },
    },
    {
        // Front-end files
        files: [
            'examples/**/*.js',
            'src/**/*.js',
        ],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        // Test files
        files: ['test/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.mocha,
            },
        },
    },
    {
        // Build files
        files: [
            '*.js',
            'test/test.js',
        ],
        languageOptions: {
            globals: globals.node,
        },
    },
]);
