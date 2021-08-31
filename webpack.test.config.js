const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    output: {
        filename: 'index.js',
        library: {
            name: 'D3Funnel',
            type: 'umd',
        },
    },
    resolve: {
        alias: {
            'd3-funnel': path.resolve(__dirname, 'src/d3-funnel/D3Funnel'),
        },
        fallback: {
            util: require.resolve('util/'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};
