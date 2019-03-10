const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackModules = require('webpack-modules')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

const publicPath = '/'

module.exports = {
  context: __dirname,

  mode: IS_PRODUCTION ? 'production' : IS_DEVELOPMENT && 'development',

  bail: IS_PRODUCTION,

  devtool: IS_PRODUCTION ? 'source-map' : 'cheap-module-source-map',

  devServer: {
    compress: true,
    contentBase: path.resolve(__dirname, 'dist'),
    historyApiFallback: true,
    useLocalIp: true,
    host: '0.0.0.0',
    overlay: {
      warnings: true,
      errors: true
    }
  },

  entry: path.resolve(__dirname, 'source/index'),

  output: {
    path: IS_PRODUCTION ? path.resolve(__dirname, 'dist') : undefined,
    pathinfo: IS_DEVELOPMENT,
    filename: 'static/js/[name].[hash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath,
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },

  resolve: {
    extensions: ['.js', '.json', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules']
  },

  module: {
    exprContextCritical: false,
    strictExportPresence: true,
    rules: [
      {
        oneOf: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            loader: 'ts-loader'
          },

          {
            test: /\.css/,
            use: [
              IS_DEVELOPMENT && { loader: 'style-loader' },
              { loader: 'css-loader', options: { sourceMap: true } }
            ].filter(Boolean)
          }
        ]
      }
    ]
  },

  plugins: [
    new WebpackModules(),

    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin(
      Object.assign(
        {},
        {
          inject: true,
          template: path.resolve(__dirname, 'source/index.html')
        },
        IS_PRODUCTION
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
              }
            }
          : undefined
      )
    ),

    IS_DEVELOPMENT && new webpack.HotModuleReplacementPlugin()
  ].filter(Boolean),

  node: {
    dgram: 'empty',
    fs: 'empty',
    module: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },

  performance: false
}
