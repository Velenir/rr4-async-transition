const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const parts = require('./webpack.parts');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build'),
  images: path.join(__dirname, 'app', 'images')
};

const templateConfig = {
  title: 'react-router Async transition example',
  inject: false,
  template: require('html-webpack-template-pug'),
  appMountId: 'app'
};


const common = merge([
  {
    entry: {
      app: PATHS.app
    },
    output: {
      path: PATHS.build,
      filename: 'js/[name].js',
      chunkFilename: 'scripts/[name].js'
    },
    resolve: {
      extensions: ['.js', '.jsx']
    }
  },
  parts.loadJavaScript(PATHS.app),
  parts.lintCSS(),
  parts.copySVG(PATHS.images)
]);

module.exports = function(env) {
  if (env === 'production') {
    return merge([
      common,
      {
        output: {
          chunkFilename: 'scripts/[chunkhash].js',
          filename: 'js/[name].[chunkhash].js',
          // Tweak this to match your GitHub project name
          // publicPath: '/webpack-project/'
        },
        plugins: [
          new webpack.HashedModuleIdsPlugin()
        ],
        recordsPath: 'records.json'
      },
      parts.indexTemplate(templateConfig, {
        inline: 'manifest'
      }),
      parts.setFreeVariables({
        'process.env.NODE_ENV': 'production'
      }),
      parts.lintJavaScript(PATHS.app),
      parts.minifyJavaScript({
        sourceMap: true
      }),
      parts.extractBundles([
        {
          name: 'vendor',
          entries: ['react', 'react-dom', 'react-router', 'react-router-dom']
        },
        {
          name: 'manifest'
        }
      ]),
      parts.clean(PATHS.build),
      parts.generateSourcemaps('source-map'),
      parts.extractCSS(),
      parts.optimizeImages(PATHS.images)
    ]);
  }
  
  return merge([
    common,
    {
      // Disable performance hints during development
      performance: {
        hints: false
      },
      plugins: [
        new webpack.NamedModulesPlugin()
      ]
    },
    parts.indexTemplate(templateConfig),
    parts.lintJavaScript(PATHS.app, {
      // Emit warnings over errors to avoid crashing
      // HMR on error.
      emitWarning: true
    }),
    parts.generateSourcemaps('eval-source-map'),
    parts.loadCSS(),
    parts.displayImages(PATHS.images),
    parts.devServer({
      // Customize host/port here if needed
      host: process.env.HOST,
      port: process.env.PORT
    })
  ]);
};
