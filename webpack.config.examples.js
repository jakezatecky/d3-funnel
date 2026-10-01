import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import path from 'node:path';

const { dirname } = import.meta;
const siteUrl = 'https://jakezatecky.github.io/d3-funnel/';

export default (env, argv) => ({
    mode: 'development',
    output: {
        path: path.join(dirname, 'examples/dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: 'css-loader',
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.woff2?$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext]',
                },
            },
            {
                test: /\.(jpg|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: '[name][ext]',
                },
            },
        ],
    },
    devServer: {
        open: true,
        static: {
            directory: path.join(dirname, 'examples/dist'),
        },
        watchFiles: ['src/**/*', 'examples/src/**/*'],
    },
    plugins: [
        new HtmlBundlerPlugin({
            entry: {
                index: 'examples/src/index.html',
            },
            sources: [
                {
                    tag: 'meta',
                    attributes: ['content'],
                    filter: ({ attributes }) => attributes.property === 'og:image',
                },
            ],
            data: {
                siteUrl,
                // Only track visits to the published site, not local development
                enableAnalytics: argv.mode === 'production',
            },
            // Link previews require an absolute URL for the Open Graph image
            beforeEmit: (content) => content.replace(
                '<meta property="og:image" content="',
                `<meta property="og:image" content="${siteUrl}`,
            ),
            js: {
                filename: '[name].[contenthash:8].js',
            },
            css: {
                // Prefix Fontsource stylesheets with their font, such as `open-sans-400.css` rather
                // than an ambiguous `400.css`
                filename: ({ filename }) => {
                    const fontDirectory = path.dirname(filename);

                    if (path.basename(path.dirname(fontDirectory)) === '@fontsource') {
                        return `${path.basename(fontDirectory)}-[name].[contenthash:8].css`;
                    }

                    return '[name].[contenthash:8].css';
                },
            },
        }),
    ],
});
