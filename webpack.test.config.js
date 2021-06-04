const path = require('path');

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
};
