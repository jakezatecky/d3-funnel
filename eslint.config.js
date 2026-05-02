import { defineConfig } from 'eslint/config';
import takiyonConfig from 'eslint-config-takiyon';
import globals from 'globals';

import webpackConfig from './webpack.config.test.js';

// Resolve issue with HTML Webpack Bundler causing circular references
// https://github.com/webdiscus/html-bundler-webpack-plugin/issues/186
delete webpackConfig.plugins;

export default defineConfig([
    takiyonConfig,
    {
        files: ['**/*.{js,jsx}'],
        settings: {
            // Account for webpack.resolve.module imports
            'import-x/resolver': {
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
    {
        // Development files
        files: [
            'test/**/*.js',
            '*.js',
        ],
        settings: {
            // Resolve `exports` fields for development files
            'import-x/resolver': {
                webpack: {
                    config: {
                        ...webpackConfig,
                        resolve: {
                            ...webpackConfig.resolve,
                            conditionNames: ['node', 'import', 'require', 'default'],
                        },
                    },
                },
            },
        },
    },
]);
