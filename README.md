# D3 Funnel

A JavaScript library for rendering funnel charts using the D3.js library. Inspired by smilli/d3-funnel-charts.

# Usage

To use this library, you must include both D3.js and the d3-funnel.js source file.

````
<script src="d3.min.js"></script>
<script src="d3-funnel.js"></script>
````

Drawing the funnel is relatively easy.

````
var options = {
	width : 350,
	height : 400
};

var chart = new D3Funnel ( data, options );
chart.draw ( "#funnel" );
````

# License

MIT License.
