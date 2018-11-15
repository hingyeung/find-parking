// https://github.com/TypeStrong/ts-loader/tree/master/examples/fast-incremental-builds
'use strict';
const path = require('path');
const minimist = require('minimist');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// lambda function to build
const target = minimist(process.argv.slice(2)).TARGET;

const webpackConfig = {
  devtool: 'inline-source-map',
  entry: `./src/${target}.ts`,
  output: {
    pathinfo: false,
    path: path.join(__dirname, "dist"),
    filename: `${target}_bundle.js`
  },
  mode: 'development',
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            experimentalWatchApi: true,
          },
        }],
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ]
};

module.exports = webpackConfig;