const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/load_sensor_data_into_db.ts",
  target: "node",
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "dist"),
    filename: "load_sensor_data_into_db.js"
  },
  stats: {
    warnings: false
  }
};