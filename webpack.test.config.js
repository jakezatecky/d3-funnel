const path = require('path');

module.exports = {
    mode: 'none',
    output: {
        filename: 'index.js',
        libraryTarget: 'umd',
        library: 'D3Funnel',
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
