module.exports = {
	output: {
		filename: 'd3-funnel.js',
		libraryTarget: 'umd',
		library: 'D3Funnel',
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
