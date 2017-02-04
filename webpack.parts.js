const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

exports.devServer = function(options) {
	return {
		devServer: {
			// Enable history API fallback so HTML5 History API based
			// routing works. This is a good default that will come
			// in handy in more complicated setups.
			historyApiFallback: true,
			
			// Unlike the cli flag, this doesn't set
			// HotModuleReplacementPlugin!
			hot: true,
			inline: true,
			
			// Display only errors to reduce the amount of output.
			stats: 'errors-only',
			
			// Parse host and port from env to allow customization.
			//
			// If you use Vagrant or Cloud9, set
			// host: options.host || '0.0.0.0';
			//
			// 0.0.0.0 is available to all network devices
			// unlike default `localhost`.
			host: options.host, // Defaults to `localhost`
			port: options.port // Defaults to 8080
		},
		plugins: [
			// Enable multi-pass compilation for enhanced performance
			// in larger projects. Good default.
			new webpack.HotModuleReplacementPlugin({
				// Disabled as this won't work with html-webpack-template yet
				//multiStep: true
			})
		]
	};
};

exports.lintJavaScript = function(paths, options) {
	return {
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					include: paths,
					
					loader: 'eslint-loader',
					enforce: 'pre',
					options: options,
				}
			]
		}
	};
};

exports.loadCSS = function(paths) {
	return {
		module: {
			rules: [
				{
					test: /\.css$/,
					// Restrict loading process to the given
					// paths.
					include: paths,
					
					use: ['style-loader', 'css-loader?importLoaders=1', 'postcss-loader']
				},
				{
					test: /\.scss$/,
					// Restrict loading process to the given
					// paths.
					include: paths,
					
					use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
				}
			]
		}
	};
};

exports.extractCSS = function(paths) {
	return {
		module: {
			rules: [
				// Extract CSS during build
				{
					test: /\.css$/,
					// Restrict extraction process to the given paths.
					include: paths,
					
					use: ExtractTextPlugin.extract({
						fallback: 'style-loader',
						use: ['css-loader?importLoaders=1', 'postcss-loader']
					})
				},
				// Extract SCSS during build
				{
					test: /\.scss$/,
					// Restrict extraction process to the given paths.
					include: paths,
					
					use: ExtractTextPlugin.extract({
						fallback: 'style-loader',
						use: ['css-loader', 'postcss-loader', 'sass-loader']
					})
				}
			]
		},
		plugins: [
			// Output extracted CSS to a file
			new ExtractTextPlugin('css/[name].[contenthash].css')
		]
	};
};

exports.lintCSS = function(paths, options) {
	return {
		module: {
			rules: [
				{
					test: /\.s?css$/,
					include: paths,
					
					loader: 'postcss-loader',
					enforce: 'pre',
					options: {
						ident: 'postcss-lint',
						plugins:
						[
							require('stylelint')(Object.assign({
								configFile: '.stylelintrc',
								// Ignore node_modules CSS
								ignoreFiles: 'node_modules/**/*.css'
							}, options))
						]
					}
				}
			]
		}
	};
};

// for development
exports.displayImages = function(paths) {
	return {
		module: {
			rules: [
				{
					test: /\.(jpe?g|png|gif)$/i,
					loader: 'file-loader',
					options: {
						name: 'img/[name].[hash].[ext]'
					},
					include: paths
				}
			]
		}
	};
};

// for production
exports.optimizeImages = function(paths) {
	return {
		module: {
			rules: [
				{
					test: /\.(jpe?g|png|gif)$/i,
					use: [
						{
							loader: 'url-loader',
							options: {
								limit: 25000,
								name: 'img/[name].[hash].[ext]'
							}
						},
						{
							loader: 'image-webpack-loader',
							options: {
								optimizationLevel: 7,
								interlaced: false
							}
						}
					],
					include: paths
				}
			]
		}
	};
};

exports.copySVG = function(paths) {
	return {
		module: {
			rules: [
				{
					test: /\.svg$/,
					loader: 'file-loader',
					options: {
						name: 'img/[name].[hash].[ext]'
					},
					include: paths
				}
			]
		}
	};
};

exports.generateSourcemaps = function(type) {
	return {
		devtool: type
	};
};

exports.extractBundles = function(bundles, options) {
	const entry = {};
	const names = [];
	
	// Set up entries and names.
	for (let { name, entries } of bundles) {
		if (entries) {
			entry[name] = entries;
		}
		
		names.push(name);
	}
	
	return {
		// Define an entry point needed for splitting.
		entry,
		plugins: [
			// Extract bundles.
			new webpack.optimize.CommonsChunkPlugin(
				Object.assign({}, options, { names })
			)
		]
	};
};

exports.clean = function(path) {
	return {
		plugins: [
			new CleanWebpackPlugin([path])
		]
	};
};

exports.loadJavaScript = function(paths) {
	return {
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					include: paths,
					
					loader: 'babel-loader',
					
					options: {
						// Enable caching for improved performance during
						// development.
						// It uses default OS directory by default. If you need
						// something more custom, pass a path to it.
						// I.e., { cacheDirectory: '<path>' }
						cacheDirectory: true
					}
				}
			]
		}
	};
};

exports.minifyJavaScript = function(options) {
	options = Object.assign({compress: {warnings: false}}, options);
	return {
		plugins: [
			new webpack.optimize.UglifyJsPlugin(options)
		]
	};
};

exports.setFreeVariables = function(definitions) {
	const env = {};
	for(let key of Object.keys(definitions)) {
		env[key] = JSON.stringify(definitions[key]);
	}
	
	return {
		plugins: [
			new webpack.DefinePlugin(env)
		]
	};
};

exports.indexTemplate = function() {
	const args = Array.prototype.concat.apply([{}], arguments);
	const options = Object.assign.apply(null, args);
	
	return {
		plugins: [
			new HtmlWebpackPlugin(options)
		]
	};
};
