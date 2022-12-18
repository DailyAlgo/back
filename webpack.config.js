const path = require('path')
const isDev = process.env.NODE_ENV !== 'production'

const serverConfig = {
  entry: './index.ts',
  context: path.resolve(__dirname, 'src'),
  mode: isDev? 'development' : 'production',
  // devtools: 'source-map',
  target: 'node', // node를 대상으로 설정
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
      ]
  },
  resolve: {
      extensions: ['.ts', '.js']
  },
  output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
  },
}



module.exports = [serverConfig]