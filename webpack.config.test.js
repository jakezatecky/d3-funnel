import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import path from 'node:path';

const { dirname } = import.meta;

export default {
    mode: 'development',
    output: {
        path: path.join(dirname, 'test/compiled'),
        clean: true,
    },
    optimization: {
        // The package declares `"sideEffects": false` for its consumers, but the test entry imports
        // each spec file purely for its side effects, so they must not be pruned
        sideEffects: false,
    },
    plugins: [
        new HtmlBundlerPlugin({
            entry: {
                index: 'test/index.html',
            },
            js: {
                filename: '[name].[contenthash:8].js',
            },
            css: {
                filename: '[name].[contenthash:8].css',
            },
        }),
    ],
};
