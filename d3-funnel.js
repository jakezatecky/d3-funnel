( function ( global ) {

	/* global d3 */
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
	 * @param {int}    options.bottomWidth Specifies the width, in pixels, that the bottom of the
	 *                                     funnel chart should be. This will affect the overall
	 *                                     appareance of the chart.
	 * @param {int}    options.bottomPinch How many sections (from the bottom) should be "pinched"
	 *                                     to have fixed width defined by options.bottomWidth.
	 * @param {bool}   options.isCurved    Whether or not the funnel is curved.
	 * @param {int}    options.curveHeight The height of the curves. Only functional if isCurved
	 *                                     is set.
	 * @param {string} options.fillType    The section background type. Either "solid" or "gradient".
	 * @param {bool}   options.isPyramid   Whether or not the funnel should be inverted to a pyramid.
	 */
	function D3Funnel ( data, options )
	{

		// Initialize options if not set
		options = typeof options !== "undefined" ? options : {};

		// Default configuration values
		var defaults = {
			width : 350,
			height : 400,
			bottomWidth : 200,
			bottomPinch : 0,
			isCurved : false,
			curveHeight : 20,
			fillType : "solid",
			isPyramid : false
		};
		var settings = defaults;
		var keys = Object.keys ( options );

		// Overwrite default settings with user options
		for ( var i = 0; i < keys.length; i++ )
		{
			settings [ keys [ i ] ] = options [ keys [ i ] ];
		}  // End for

		this.data = data;

		// Initialize funnel chart settings
		this.width = settings.width;
		this.height = settings.height;
		this.bottomWidth = settings.bottomWidth;
		this.bottomPinch = settings.bottomPinch;
		this.isCurved = settings.isCurved;
		this.curveHeight = settings.curveHeight;
		this.fillType = settings.fillType;
		this.isPyramid = settings.isPyramid;

	}  // End D3Funnel

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

	};  // End draw

	global.D3Funnel = D3Funnel;

} )( this );
