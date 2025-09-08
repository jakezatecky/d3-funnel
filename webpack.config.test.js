import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import path from 'node:path';

const { dirname } = import.meta;

export default {
    mode: 'development',
    entry: {
        index: path.join(dirname, 'test/index.js'),
    },
    output: {
        path: path.join(dirname, 'test/compiled'),
        library: {
            name: 'D3Funnel',
            type: 'umd',
        },
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            'd3-funnel': path.resolve(dirname, 'src/index.js'),
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
