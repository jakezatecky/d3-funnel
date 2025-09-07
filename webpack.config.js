import path from 'node:path';
import { readFile } from 'node:fs/promises';
import webpack from 'webpack';

const json = await readFile(new URL('./package.json', import.meta.url));
const pkg = JSON.parse(json.toString());
const banner = `
${pkg.name} - v${pkg.version}
Copyright (c) ${pkg.author}
Licensed under the ${pkg.license} License.
`;
const fileMap = {
    node: 'd3-funnel.js',
    web: 'd3-funnel.min.js',
};

const { dirname } = import.meta;

function makeConfig({ target }) {
    return {
        mode: 'none',
        target,
        entry: path.join(dirname, 'src/index.js'),
        output: {
            path: path.join(dirname, '/dist'),
            filename: fileMap[target],
            library: {
                name: 'D3Funnel',
                type: 'umd',
                umdNamedDefine: true,
            },
        },
        resolve: {
            extensions: ['.js'],
        },
        externals: [
            {
                // Do not compile d3 with the output
                // In the browser, this allows window.d3 to be used
                // In Node, this will use the included d3 package
                d3: 'd3',
            },
        ],
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules)/,
                    loader: 'babel-loader',
                },
            ],
        },
        plugins: [
            new webpack.BannerPlugin(banner.trim()),
        ],
    };
}

export default makeConfig;
