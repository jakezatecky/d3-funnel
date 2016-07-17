module.exports = {
	output: {
		filename: 'd3-funnel.js',
		libraryTarget: 'umd',
		library: 'D3Funnel',
	},
	externals: {
		// Do not compile d3 with the output
		// In non-CommonJS, allows window.d3 to be used
		// In CommonJS, this will use the included d3 package
		d3: 'd3',
	},
	module: {
		loaders: [
			{
				test: /\.js?$/,
				exclude: /(node_modules|bower_components|vender_modules)/,
				loader: 'babel',
				query: {
					presets: ['es2015', 'stage-0'],
				},
			},
		],
	},
};
