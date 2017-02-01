const autoprefixer = require('autoprefixer');
// const stylelint = require('stylelint');

// module.exports = function (ctx) {
// 	// extract options from 'postcss-loader?options'
// 	// or stringified options object from {loader: 'postcss-loader', options: {}}
// 	const {loaderIndex, loaders} = ctx.webpack;
// 	const {options} = loaders[loaderIndex];
//
// 	console.log("\n\n===\n",options, "ind:", loaderIndex, "of", loaders.length - 1);
// 	console.log("ctx.lint", ctx.lint);
// 	console.log("ctx.package", ctx.package);
// 	console.log("ctx.plugins", ctx.plugins);
// 	console.log("ctx.parser", ctx.parser);
// 	// console.log("loader", loaders[loaderIndex]);
// 	console.log("KEYS:", Object.keys(ctx));
// 	console.log("ctx.webpack.plugins", ctx.webpack.plugins);
// 	console.log("\n===\n\n");
//
// 	if(options === "lint") {
// 		return {
// 			// plugin order matters
// 			plugins: [
// 				stylelint({
// 					configFile: '.stylelintrc',
// 					// Ignore node_modules CSS
// 					ignoreFiles: 'node_modules/**/*.css'
// 				})
// 			]
// 		};
// 	}
//
// 	return {
// 		plugins: [autoprefixer]
// 	};
// };

module.exports = {
	plugins: [autoprefixer]
};
