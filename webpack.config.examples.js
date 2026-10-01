import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import path from 'node:path';

const { dirname } = import.meta;

export default (env, argv) => ({
    mode: 'development',
    output: {
        path: path.join(dirname, 'examples/dist'),
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            'd3-funnel': path.resolve(dirname, 'src/index.js'),
        },
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
            },
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
            data: {
                // Only track visits to the published site, not local development
                enableAnalytics: argv.mode === 'production',
            },
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
