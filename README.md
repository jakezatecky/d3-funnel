# D3 Funnel

d3-funnel.js is a JavaScript library for rendering SVG funnel and pyramid charts using the D3.js framework. This libray
was initially inspired by [smilli/d3-funnel-charts](https://github.com/smilli/d3-funnel-charts), but includes many
improvements that can be specified through initialization options.

# Examples

An example showing some of the possible options can be found [here](https://cdn.rawgit.com/jakezatecky/d3-funnel/master/example/index.html).

# Usage

To use this library, you must include both D3.js and the d3-funnel.js source file.

```` html
<script src="d3.min.js"></script>
<script src="d3-funnel.js"></script>
````

Drawing the funnel is relatively easy.

```` javascript
var data = [
	[ "Plants", "5,000" ],
	[ "Flowers", "2,500" ],
	[ "Perennials", "200" ],
	[ "Roses", "50" ]
];
var options = {
	width : 350,
	height : 400,
	bottomWidth : 1/3
};

var chart = new D3Funnel ( data, options );
chart.draw ( "#funnel" );
````

More advanced options also exist.

```` javascript
var advanced = {
	bottomPinch : 0,      // How many sections to pinch
	isCurved : false,     // Whether the funnel is curved
	curveHeight : 20,     // The curvature amount
	fillType : "solid",   // Either "solid" or "gradient"
	isInverted : false,   // Whether the funnel is inverted
	hoverEffects : false  // Whether the funnel has effects on hover
};
````

# License

MIT license.
