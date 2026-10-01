import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';
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

// Build the minified bundle for CDNs and `<script>` tags. Package consumers import `src` directly,
// so this is the only build artifact.
export default {
    target: 'browserslist',
    mode: 'production',
    entry: path.join(dirname, 'src/index.js'),
    externals: [
        // Resolve the D3 modules to the full D3 library, which is the `d3` global in the browser,
        // rather than bundling a second copy. Other dependencies (i.e., nanoid) are bundled.
        ({ request }, callback) => {
            if (/^d3-/.test(request)) {
                callback(null, {
                    root: 'd3',
                    commonjs: 'd3',
                    commonjs2: 'd3',
                    amd: 'd3',
                });

                return;
            }

            callback();
        },
    ],
    optimization: {
        minimizer: [
            // Escape non-ASCII characters so that the bundle works on pages that do not declare a
            // UTF-8 charset
            new TerserPlugin({
                terserOptions: {
                    format: { ascii_only: true },
                },
            }),
        ],
    },
    output: {
        path: path.join(dirname, '/dist'),
        filename: 'd3-funnel.min.js',
        clean: true,
        library: {
            name: 'D3Funnel',
            type: 'umd',
            export: 'default',
            umdNamedDefine: true,
        },
    },
    plugins: [
        new webpack.BannerPlugin(banner.trim()),
    ],
};
