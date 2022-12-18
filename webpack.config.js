const path = require('path')
const NodemonPlugin = require('nodemon-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const CompressionPlugin = require('compression-webpack-plugin')

const isDev = process.env.NODE_ENV !== 'production'

const fileLoader = {
  loader: 'file-loader',
  options: {
    name: '[path][name].[contenthash:16].[ext]',
    context: path.resolve(__dirname, 'src/assets'),
    publicPath: '/static',
    outputPath: 'static',
  },
}

const serverConfig = {
  entry: './index.ts',
  context: path.resolve(__dirname, 'src'),
  mode: isDev ? 'development' : 'production',
  devtool: 'source-map',
  target: 'node', // node를 대상으로 설정
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  node: {
    __dirname: false,
  },
  plugins: [
    new NodemonPlugin({
      watch: path.resolve('./dist'),
      script: './dist/index.js',
    }),
    ...(isDev ? [] : []),
  ],
  optimization: {
    minimize: false,
  },
}

module.exports = [serverConfig]
