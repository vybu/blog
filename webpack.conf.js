const path = require('path');
const WebpackMd5Hash = require('webpack-md5-hash');

module.exports = {
    entry: './src/index.ts',
    resolve: {
        extensions: ['.js', '.ts']
    },
    devtool: 'source-map',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'myLib',
        libraryTarget: 'window'
    },
    target: 'web',
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' }
        ]
    },
    plugins: [
        new WebpackMd5Hash()
    ]
};

// resources
// https://www.npmjs.com/package/awesome-typescript-loader
// https://github.com/coryhouse/react-slingshot/blob/master/webpack.config.dev.js

// TODO
// - split into dev and prod configurations
