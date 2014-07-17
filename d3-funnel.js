( function ( global ) {

	/* global d3 */
  /* jshint bitwise: false */
	"use strict";

	/**
	 * D3Funnel
	 *
	 * An object representing a D3-driven funnel chart. Instantiates the funnel's configuration
	 * and data parameters.
	 *
	 * @param {array}  data    A list of rows containing a category and a count.
	 * @param {Object} options An optional configuration object for chart options.
	 *
	 * @param {int}    options.width       Initial width. Specified in pixels.
	 * @param {int}    options.height      Chart height. Specified in pixels.
	 * @param {int}    options.bottomWidth Specifies the width percent the bottom should be in
	 *                                     relation to the chart's overall width.
	 * @param {int}    options.bottomPinch How many sections (from the bottom) should be "pinched"
	 *                                     to have fixed width defined by options.bottomWidth.
	 * @param {bool}   options.isCurved    Whether or not the funnel is curved.
	 * @param {int}    options.curveHeight The height of the curves. Only functional if isCurved
	 *                                     is set.
	 * @param {string} options.fillType    The section background type. Either "solid" or "gradient".
	 * @param {bool}   options.isInverted  Whether or not the funnel should be inverted to a pyramid.
	 */
	function D3Funnel ( data, options )
	{

		if ( !this._isArray ( data ) || data.length === 0 ||
			!this._isArray ( data [ 0 ] ) || data [ 0 ].length < 2 )
		{
			throw {
				name : "D3 Funnel Data Error",
				message : "Funnel initialization data is not valid."
			};
		}  // End if

		// Initialize options if not set
		options = typeof options !== "undefined" ? options : {};

		// Default configuration values
		var defaults = {
			width : 350,
			height : 400,
			bottomWidth : 1/3,
			bottomPinch : 0,
			isCurved : false,
			curveHeight : 20,
			fillType : "solid",
			isInverted : false
		};
		var settings = defaults;
		var keys = Object.keys ( options );

		// Overwrite default settings with user options
		for ( var i = 0; i < keys.length; i++ )
		{
			settings [ keys [ i ] ] = options [ keys [ i ] ];
		}  // End for

		this.data = data;

		var colorScale = d3.scale.category10 ();

		// Initialize the colors
		for ( var i = 0; i < this.data.length; i++ )
		{

			var hexExpression = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

			// If a color is not set for the record, add one
			if ( typeof this.data [ i ][ 2 ] === "undefined" ||
				!hexExpression.test ( this.data [ i ][ 2 ] ) )
			{
				this.data [ i ][ 2 ] = colorScale ( i );
			}  // End if

		}  // End for

		// Initialize funnel chart settings
		this.width = settings.width;
		this.height = settings.height;
		this.bottomWidth = settings.width * settings.bottomWidth;
		this.bottomPinch = settings.bottomPinch;
		this.isCurved = settings.isCurved;
		this.curveHeight = settings.curveHeight;
		this.fillType = settings.fillType;
		this.isInverted = settings.isInverted;

		// Calculate the bottom left x position
		this.bottomLeftX = ( this.width - this.bottomWidth ) / 2;

		// Change in x direction
		// Will be sharper if there is a pinch
		this.dx = this.bottomPinch > 0 ?
			this.bottomLeftX / ( data.length - this.bottomPinch ) :
			this.bottomLeftX / data.length;
		// Change in y direction
		// Curved chart needs reserved pixels to account for curvature
		this.dy = this.isCurved ?
			( this.height - this.curveHeight ) / data.length :
			this.height / data.length;

	}  // End D3Funnel

	/**
	 * Check if the supplied value is an array.
	 *
	 * @param {mixed} value
	 *
	 * @return {bool}
	 */
	D3Funnel.prototype._isArray = function ( value )
	{

		return Object.prototype.toString.call ( value ) === "[object Array]";

	};  // End _isArray

	/**
	 * Draw the chart on the target element. This will clear any content of the target element
	 * and write a new funnel chart on top of it given the initialization options.
	 *
	 * @param {string} selector A valid D3 selector.
	 */
	D3Funnel.prototype.draw = function ( selector )
	{

		// Remove any previous drawings
		d3.select ( selector ).selectAll ( "svg" ).remove ();

		// Add the SVG and group element
		var svg = d3.select ( selector )
			.append ( "svg" )
			.attr ( "width", this.width )
			.attr ( "height", this.height )
			.append ( "g" );

		var sectionPaths = this._makePaths ();

		// Define color gradients
		if ( this.fillType === "gradient" )
		{
			this._defineColorGradients ( svg );
		}  // End if

		// Add top oval if curved
		if ( this.isCurved )
		{
			this._drawTopOval ( svg, sectionPaths );
		}  // End if

		// Add each block section
		for ( var i = 0; i < sectionPaths.length; i++ )
		{

			// Set the background color
			var fill = this.fillType !== "gradient" ?
				 this.data [ i ][ 2 ] :
				"url(#gradient-" + i + ")";

			// Prepare data to assign to the section
			var data = {
				index : i,
				record : this.data [ i ]
			};

			// Construct path string
			var paths = sectionPaths [ i ];
			var pathStr = "";
			var path = [];

			// Iterate through each point
			for ( var j = 0; j < paths.length; j++ )
			{
				path = paths [ j ];
				pathStr += path [ 2 ] + path [ 0 ] + "," + path [ 1 ] + " ";
			}  // End for

			// Draw the sections's path and append the data
			svg.append ( "path" )
				.attr ( "fill", fill )
				.attr ( "d", pathStr )
				.data ( [ data ] );

			// Add the section label
			var textStr = this.data [ i ][ 0 ] + ": " + this.data [ i ][ 1 ];
			var textX = this.width / 2;   // Center the text
			var textY = !this.isCurved ?  // Average height of bases
				( this.dy * ( 2 * i + 1 ) ) / 2 :
				( paths [ 1 ][ 1 ] + paths [ 3 ][ 1 ] ) / 2;

			svg.append ( "text" )
				.text ( textStr )
				.attr ( "x", textX )
				.attr ( "y", textY )
				.attr ( "text-anchor", "middle" )
				.attr ( "dominant-baseline", "middle" )
				.attr ( "fill", "#fff" )
				.style ( "font-size", "14px" );

		}  // End for


	};  // End draw

	/**
	 * Create the paths to be used to define the discrete funnel sections and returns
	 * the results in an array.
	 *
	 * @return {array}
	 */
	D3Funnel.prototype._makePaths = function ()
	{

		var paths = [];

		// Initialize velocity
		var dx = this.dx;
		var dy = this.dy;

		// Initialize starting positions
		var prevLeftX = 0;
		var prevRightX = this.width;
		var prevHeight = 0;

		// Start from the bottom for inverted
		if ( this.isInverted )
		{
			prevLeftX = this.bottomLeftX;
			prevRightX = this.width - this.bottomLeftX;
		}  // End if

		// Initialize next positions
		var nextLeftX = 0;
		var nextRightX = 0;
		var nextHeight = 0;

		var middle = this.width / 2;

		// Move down if there is an initial curve
		if ( this.isCurved )
		{
			prevHeight = 10;
		}  // End if

		// Create the path definition for each funnel section
		// Remember to loop back to the beginning point for a closed path
		for ( var i = 0; i < this.data.length; i++ )
		{

			// Stop velocity for pinched sections
			if ( this.bottomPinch > 0 )
			{

				// Check if we've reached the bottom of the pinch
				// If so, stop changing on x
				if ( !this.isInverted )
				{
					if ( i >= this.data.length - this.bottomPinch )
					{
						dx = 0;
					}  // End if
				}
				// Pinch at the first sections relating to the bottom pinch
				// Revert back to normal velocity after pinch
				else
				{
					dx = i < this.bottomPinch ? 0 : this.dx;
				}  // End if

			}  // End if

			// Calculate the position of next section
			nextLeftX = prevLeftX + dx;
			nextRightX = prevRightX - dx;
			nextHeight = prevHeight + dy;

			// Expand outward if inverted
			if ( this.isInverted )
			{
				nextLeftX = prevLeftX - dx;
				nextRightX = prevRightX + dx;
			}  // End if

			// Plot curved lines
			if ( this.isCurved )
			{

				paths.push ( [
					// Top Bezier curve
					[ prevLeftX, prevHeight, "M" ],
					[ middle, prevHeight + ( this.curveHeight - 10 ), "Q" ],
					[ prevRightX, prevHeight, "" ],
					// Right line
					[ nextRightX, nextHeight, "L" ],
					// Bottom Bezier curve
					[ nextRightX, nextHeight, "M" ],
					[ middle, nextHeight + this.curveHeight, "Q" ],
					[ nextLeftX, nextHeight, "" ],
					// Left line
					[ prevLeftX, prevHeight, "L" ]
				] );

			}
			// Plot straight lines
			else
			{

				paths.push ( [
					// Start position
					[ prevLeftX, prevHeight, "M" ],
					// Move to right
					[ prevRightX, prevHeight, "L" ],
					// Move down
					[ nextRightX, nextHeight, "L" ],
					// Move to left
					[ nextLeftX, nextHeight, "L" ],
					// Wrap back to top
					[ prevLeftX, prevHeight, "L" ],
				] );

			} // End if

			// Set the next section's previous position
			prevLeftX = nextLeftX;
			prevRightX = nextRightX;
			prevHeight = nextHeight;

		}  // End for

		return paths;

	};  // End _makePaths

	/**
	 * Define the linear color gradients.
	 *
	 * @param {Object} svg
	 */
	D3Funnel.prototype._defineColorGradients = function ( svg )
	{

		var defs = svg.append ( "defs" );

		// Create a gradient for each section
		for ( var i = 0; i < this.data.length; i++ )
		{

			var color = this.data [ i ][ 2 ];
			var shade = shadeColor ( color, -0.25 );

			// Create linear gradient
			var gradient = defs.append ( "linearGradient" )
				.attr ( {
					id : "gradient-" + i,
					cx : "50%",
					cy : "50%",
					r : "50%",
					fx : "50%",
					fy : "50%"
				} );

			// Define the gradient stops
			var stops = [
				[ 0, shade ],
				[ 40, color ],
				[ 60, color ],
				[ 100, shade ]
			];

			// Add the gradient stops
			for ( var j = 0; j < stops.length; j++ )
			{
				var stop = stops [ j ];
				gradient.append ( "stop" ).attr ( {
					offset : stop [ 0 ] + "%",
					style : "stop-color:" + stop [ 1 ]
				} );
			}  // End for

		}  // End for

	};  // End _defineColorGradients

	/**
	 * Draw the top oval of a curved funnel.
	 *
	 * @param {Object} svg
	 * @param {array}  sectionPaths
	 */
	D3Funnel.prototype._drawTopOval = function ( svg, sectionPaths )
	{

		var leftX = 0;
		var rightX = this.width;
		var centerX = this.width / 2;

		if ( this.isInverted )
		{
			leftX = this.bottomLeftX;
			rightX = this.width - this.bottomLeftX;
		}  // End if

		// Create path form top-most section
		var paths = sectionPaths [ 0 ];
		var path = "M" + leftX + "," + paths [ 0 ][ 1 ] +
			" Q" + centerX + "," + ( paths [ 1 ][ 1 ] + this.curveHeight - 10 ) +
			" " + rightX + "," + paths [ 2 ][ 1 ] +
			" M" + rightX + ",10" +
			" Q" + centerX + ",0" +
			" " + leftX + ",10";

		// Draw top oval
		svg.append ( "path" )
			.attr ( "fill", shadeColor ( this.data [ 0 ][ 2 ], -0.4 ) )
			.attr ( "d", path );

	};  // End _drawTopOval

	/**
	 * Shade a color to the given percentage.
	 *
 	 * @param {string} color A hex color.
 	 * @param {float}  shade The shade adjustment. Can be positive or negative.
	 */
	function shadeColor ( color, shade )
	{

		var f = parseInt ( color.slice ( 1 ), 16 );
		var t = shade < 0 ? 0 : 255;
		var p = shade < 0 ? shade * -1 : shade;
		var R = f >> 16, G = f >> 8 & 0x00FF;
		var B = f & 0x0000FF;

		var converted = ( 0x1000000 + ( Math.round ( ( t - R ) * p ) + R ) *
			0x10000 + ( Math.round ( ( t - G ) * p ) + G ) *
			0x100 + ( Math.round ( ( t - B ) * p ) + B ) );

		return "#" + converted.toString ( 16 ).slice ( 1 );

	}  // End shadeColor

	global.D3Funnel = D3Funnel;

} )( this );
