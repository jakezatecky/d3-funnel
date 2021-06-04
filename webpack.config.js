module.exports = {
    mode: 'production',
    output: {
        filename: 'd3-funnel.js',
        library: {
            name: 'D3Funnel',
            type: 'umd',
        },
    },
    externals: {
        // Do not compile d3 with the output
        // In non-CommonJS, allows window.d3 to be used
        // In CommonJS, this will use the included d3 package
        d3: 'd3',
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
