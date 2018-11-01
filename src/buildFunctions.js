const webpack = require('webpack');
const path = require('path');

const compiler = webpack({
  mode: 'production',
  target: 'node',
  entry: path.resolve(__dirname, '../distServer/server/index.js'),
  output: {
    path: path.join(__dirname, '../functions'),
    filename: 'api.js',
    libraryTarget: 'commonjs',
  },
});

compiler.run((err, stats) => {
  if (err) console.error(err);

  const statsJson = stats.toJson();

  if (stats.hasErrors() || stats.hasWarnings()) {
    console.error('Errors: ')
    console.error(statsJson.errors);
    console.warn('Warnings: ')
    console.warn(statsJson.warnings);
  }

  console.info('Successfully compiled JS and CSS');
  console.log(statsJson.assets);
});
