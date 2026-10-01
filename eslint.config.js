import { defineConfig, globalIgnores } from 'eslint/config';
import takiyonConfig from 'eslint-config-takiyon';
import { createNodeResolver } from 'eslint-plugin-import-x';
import globals from 'globals';

export default defineConfig([
    // Build output
    globalIgnores([
        'dist/',
        'examples/dist/',
        'test/compiled/',
    ]),
    takiyonConfig,
    {
        files: ['**/*.{js,jsx}'],
        settings: {
            'import-x/resolver-next': [
                createNodeResolver(),
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
