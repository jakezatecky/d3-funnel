const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const path = require('node:path');

module.exports = {
    mode: 'development',
    entry: {
        index: path.join(__dirname, 'test/index.js'),
        style: path.join(__dirname, 'test/style.scss'),
    },
    output: {
        path: path.join(__dirname, 'test/compiled'),
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
