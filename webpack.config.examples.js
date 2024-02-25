import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* eslint-disable no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'development',
    entry: {
        index: path.join(__dirname, 'examples/src/index.js'),
        style: path.join(__dirname, 'examples/src/scss/style.scss'),
    },
    output: {
        path: path.join(__dirname, 'examples/dist'),
        library: {
            name: 'D3Funnel',
            type: 'umd',
        },
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            'd3-funnel': path.resolve(__dirname, 'src/index.js'),
        },
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'css-loader',
                    'sass-loader',
                ],
            },
        ],
    },
    devServer: {
        open: true,
        static: {
            directory: path.join(__dirname, 'examples/dist'),
        },
        watchFiles: ['src/**/*', 'examples/src/**/*'],
    },
    plugins: [
        new HtmlBundlerPlugin({
            entry: {
                index: 'examples/src/index.html',
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
