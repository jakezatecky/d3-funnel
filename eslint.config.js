import takiyonConfig from 'eslint-config-takiyon';
import globals from 'globals';

import webpackConfig from './webpack.config.test.js';

// Resolve issue with HTML Webpack Bundler causing circular references
// https://github.com/webdiscus/html-bundler-webpack-plugin/issues/186
delete webpackConfig.plugins;

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
        files: ['*.js'],
        languageOptions: {
            globals: globals.node,
        },
    },
];
