const path = require('path');
const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies

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
        // Resolve dependency issues with Sinon and Webpack
        fallback: {
            'process/browser': require.resolve('process/browser'),
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
        // Resolve dependency issues with Sinon and Webpack
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
};
