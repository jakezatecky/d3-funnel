import path from 'node:path';
import webpack from 'webpack';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

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

/* eslint-disable no-underscore-dangle */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function makeConfig({ target }) {
    return {
        mode: 'none',
        target,
        entry: path.join(__dirname, 'src/index.js'),
        output: {
            path: path.join(__dirname, '/dist'),
            filename: fileMap[target],
            library: {
                name: 'D3Funnel',
                type: 'umd',
                umdNamedDefine: true,
            },
        },
        resolve: {
            extensions: ['.js', '.jsx'],
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
