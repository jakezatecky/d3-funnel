import path from 'node:path';
import webpack from 'webpack';
import { readFile } from 'node:fs/promises';

const { dirname } = import.meta;
const json = await readFile(new URL('./package.json', import.meta.url));
const pkg = JSON.parse(json.toString());
const banner = `
${pkg.name} - v${pkg.version}
Copyright (c) ${pkg.author}
Licensed under the ${pkg.license} License.
`;

const commonConfig = {
    target: 'web',
    entry: path.join(dirname, 'src/index.js'),
    resolve: {
        extensions: ['.js'],
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
    externals: {
        // Do not compile d3 with the output
        // In the browser, this allows window.d3 to be used
        // In Node, this will use the included d3 package
        d3: 'd3',
    },
    plugins: [
        new webpack.BannerPlugin(banner.trim()),
    ],
};

const configMap = {
    esm: {
        ...commonConfig,
        mode: 'none',
        output: {
            path: path.join(dirname, '/dist'),
            filename: 'index.esm.js',
            library: {
                type: 'module',
            },
        },
        experiments: {
            outputModule: true,
        },
    },
    umd: {
        ...commonConfig,
        mode: 'none',
        output: {
            path: path.join(dirname, '/dist'),
            filename: 'index.cjs.js',
            library: {
                name: 'D3Funnel',
                type: 'umd',
                umdNamedDefine: true,
            },
        },
    },
    browser: {
        ...commonConfig,
        mode: 'production',
        output: {
            path: path.join(dirname, '/dist'),
            filename: 'd3-funnel.min.js',
            library: {
                name: 'D3Funnel',
                type: 'umd',
                umdNamedDefine: true,
            },
        },
    },
};

function makeConfig({ target }) {
    return configMap[target];
}

export default makeConfig;
