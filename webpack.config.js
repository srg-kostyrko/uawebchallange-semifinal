const webpack = require('webpack');

module.exports = {
  context: __dirname + "/src",
  entry: "./win.js",
  output: {
      path: __dirname + "/dist",
      filename: "bundle.js"
  },
  module: {
	preLoaders: [
      {test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
    ],
    loaders:
      [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
      ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
};
