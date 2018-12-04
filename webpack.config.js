// https://github.com/TypeStrong/ts-loader/tree/master/examples/fast-incremental-builds
'use strict';
const path = require('path');
const minimist = require('minimist');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// lambda function to build
const target = minimist(process.argv.slice(2)).TARGET;

const webpackConfig = {
  devtool: 'source-map',
  entry: `./src/${target}.ts`,
  output: {
    pathinfo: false,
    path: path.join(__dirname, "dist"),
    filename: `${target}_bundle.js`,
    libraryTarget: 'commonjs2'
  },
  mode: 'production',
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
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({workers:2})
  ],
  // https://stackoverflow.com/questions/41248575/webpack-react-process-env-always-empty-windows-10
  // node: {process: false},
  target: "node"
};

module.exports = webpackConfig;