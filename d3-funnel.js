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
	 */
	function D3Funnel ( data, options )
	{

	}  // End D3Funnel

	/**
	 * Draw the chart on the target element. This will clear any content of the target element
	 * and write a new funnel chart on top of it given the initialization options.
	 *
	 * @param {string} selector A valid D3 selector.
	 */
	D3Funnel.prototype.draw = function ( selector )
	{

	};  // End draw

	global.D3Funnel = D3Funnel;

} )( this );
