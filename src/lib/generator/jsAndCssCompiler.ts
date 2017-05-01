import webpack = require('webpack');
import WebpackMd5Hash = require('webpack-md5-hash');
import ExtractTextPlugin = require('extract-text-webpack-plugin');
import autoprefixer = require('autoprefixer');
import path = require('path');
import { dist, stylesEntryFile, jsEntryFile, swFile, stylesPaths, isDevMode } from '../constants';

interface WebpackStatsAsset {
    name: string
}

interface CompiledFileNames {
    css: string[],
    js: string[]
}

export function getJSAndCSSCompiler(): Function {

    const plugins = [
        new ExtractTextPlugin(isDevMode ? '[name].css' : '[name].[contenthash].css'),
        new webpack.LoaderOptionsPlugin({
            minimize: !isDevMode,
            debug: false,
            noInfo: true, // set to false to see a list of every file being bundled.
            options: {
                sassLoader: {
                    includePaths: [stylesPaths]
                },
                context: '/',
                postcss: () => [autoprefixer],
            }
        })
    ];

    if (!isDevMode) {
        plugins.unshift(new webpack.optimize.UglifyJsPlugin({ sourceMap: true }));
        plugins.unshift(new WebpackMd5Hash());
    }

    const compiler = webpack({
        stats: 'none',
        entry: [
            stylesEntryFile,
            jsEntryFile
        ],
        devtool: 'source-map',

        resolve: {
            extensions: ['.js', '.ts', '.scss']
        },
        output: {
            filename: isDevMode ? '[name].js' : '[name].[chunkhash].js',
            path: dist,
            publicPath: '/'
        },
        target: 'web',
        module: {
            rules: [
                { test: /\.tsx?$/, loader: 'awesome-typescript-loader?silent=true&configFileName=tsconfig.client.json' },
                { test: /(\.css|\.scss|\.sass)$/, loader: ExtractTextPlugin.extract('css-loader?sourceMap!postcss-loader!sass-loader?sourceMap') }
            ]
        },
        plugins
    });

    // TODO: probably need to have different script in which it builds and run sw.js, while in others t doesn't;
    const swCompiler = webpack({
        stats: 'none',
        entry: swFile,
        devtool: 'source-map',
        resolve: {
            extensions: ['.js', '.ts', '.scss']
        },
        output: {
            filename: 'sw.js',
            path: dist,
            publicPath: '/'
        },
        target: 'web',
        module: {
            rules: [
                { test: /\.tsx?$/, loader: 'awesome-typescript-loader?silent=true&configFileName=tsconfig.client.json' },
            ]
        },
        plugins: [new webpack.optimize.UglifyJsPlugin({ sourceMap: true })]
    });

    return (): Promise<CompiledFileNames> => {
        return new Promise((resolve, reject) => {
            swCompiler.run((err, stats) => {
                const statsJson = stats.toJson();

                if (stats.hasErrors() || stats.hasWarnings()) {
                    console.error('Failed to compile sw.js');
                    console.error(statsJson.errors);
                    console.warn(statsJson.warnings);
                }

                console.info('Successfully compiled sw.js');
            });

            compiler.run((err, stats) => {
                if (err) reject(err);

                const statsJson = stats.toJson();

                if (stats.hasErrors() || stats.hasWarnings()) {
                    console.error(statsJson.errors);
                    console.warn(statsJson.warnings);
                }

                console.info('Successfully compiled JS and CSS');
                resolve(getJsAndCssFileNames(statsJson.assets));
            });
        });
    };

}

function getJsAndCssFileNames(assets: WebpackStatsAsset[]): CompiledFileNames {
    return assets.reduce((result, asset) => {
        if (asset.name.endsWith('.js') && !asset.name.includes('sw.')) {
            result.js.push(asset.name);
        }

        if (asset.name.endsWith('.css')) {
            result.css.push(asset.name);
        }

        return result;

    }, { js: [], css: [] });
}
