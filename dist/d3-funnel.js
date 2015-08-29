
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(["d3"], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('d3'));
  } else {
    root.D3Funnel = factory(root.d3);
  }
}(this, function(d3) {

/* global d3, LabelFormatter, Navigator, Utils */
/* exported D3Funnel */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var D3Funnel = (function () {

	/**
  * @param {string} selector A selector for the container element.
  *
  * @return {void}
  */

	function D3Funnel(selector) {
		_classCallCheck(this, D3Funnel);

		this.selector = selector;

		// Default configuration values
		this.defaults = {
			width: 350,
			height: 400,
			bottomWidth: 1 / 3,
			bottomPinch: 0,
			isCurved: false,
			curveHeight: 20,
			fillType: 'solid',
			isInverted: false,
			hoverEffects: false,
			dynamicArea: false,
			minHeight: false,
			animation: false,
			label: {
				fontSize: '14px',
				fill: '#fff',
				format: '{l}: {f}'
			},
			onItemClick: null
		};

		this.labelFormatter = new LabelFormatter();

		this.navigator = new Navigator();
	}

	/* exported LabelFormatter */

	/**
  * Remove the funnel and its events from the DOM.
  *
  * @return {void}
  */

	_createClass(D3Funnel, [{
		key: 'destroy',
		value: function destroy() {
			// D3's remove method appears to be sufficient for removing the events
			d3.select(this.selector).selectAll('svg').remove();
		}

		/**
   * Draw the chart inside the container with the data and configuration
   * specified. This will remove any previous SVG elements in the container
   * and draw a new funnel chart on top of it.
   *
   * @param {Array}  data    A list of rows containing a category, a count,
   *                         and optionally a color (in hex).
   * @param {Object} options An optional configuration object to override
   *                         defaults. See the docs.
   *
   * @return {void}
   */
	}, {
		key: 'draw',
		value: function draw(data) {
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			this.destroy();

			this._initialize(data, options);

			this._draw();
		}

		/**
   * Initialize and calculate important variables for drawing the chart.
   *
   * @param {Array}  data
   * @param {Object} options
   *
   * @return {void}
   */
	}, {
		key: '_initialize',
		value: function _initialize(data, options) {
			this._validateData(data);

			this._setData(data);

			var settings = this._getSettings(options);

			// Set labels
			this.label = settings.label;
			this.labelFormatter.setFormat(this.label.format);

			// Initialize funnel chart settings
			this.width = settings.width;
			this.height = settings.height;
			this.bottomWidth = settings.width * settings.bottomWidth;
			this.bottomPinch = settings.bottomPinch;
			this.isCurved = settings.isCurved;
			this.curveHeight = settings.curveHeight;
			this.fillType = settings.fillType;
			this.isInverted = settings.isInverted;
			this.hoverEffects = settings.hoverEffects;
			this.dynamicArea = settings.dynamicArea;
			this.minHeight = settings.minHeight;
			this.animation = settings.animation;

			// Calculate the bottom left x position
			this.bottomLeftX = (this.width - this.bottomWidth) / 2;

			// Change in x direction
			this.dx = this._getDx();

			// Change in y direction
			this.dy = this._getDy();

			// Support for events
			this.onItemClick = settings.onItemClick;
		}

		/**
   * @param {Array} data
   *
   * @return void
   */
	}, {
		key: '_validateData',
		value: function _validateData(data) {
			if (Array.isArray(data) === false || data.length === 0 || Array.isArray(data[0]) === false || data[0].length < 2) {
				throw new Error('Funnel data is not valid.');
			}
		}

		/**
   * @param {Array} data
   *
   * @return void
   */
	}, {
		key: '_setData',
		value: function _setData(data) {
			this.data = data;

			this._setColors();
		}

		/**
   * Set the colors for each block.
   *
   * @return {void}
   */
	}, {
		key: '_setColors',
		value: function _setColors() {
			var _this = this;

			var colorScale = d3.scale.category10();
			var hexExpression = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

			// Add a color for for each block without one
			this.data.forEach(function (block, index) {
				if (block.length < 3 || !hexExpression.test(block[2])) {
					_this.data[index][2] = colorScale(index);
				}
			});
		}

		/**
   * @param {Object} options
   *
   * @returns {Object}
   */
	}, {
		key: '_getSettings',
		value: function _getSettings(options) {
			// Prepare the configuration settings based on the defaults
			// Set the default width and height based on the container
			var settings = Utils.extend({}, this.defaults);
			settings.width = parseInt(d3.select(this.selector).style('width'), 10);
			settings.height = parseInt(d3.select(this.selector).style('height'), 10);

			// Overwrite default settings with user options
			settings = Utils.extend(settings, options);

			// In the case that the width or height is not valid, set
			// the width/height as its default hard-coded value
			if (settings.width <= 0) {
				settings.width = this.defaults.width;
			}
			if (settings.height <= 0) {
				settings.height = this.defaults.height;
			}

			return settings;
		}

		/**
   * @return {Number}
   */
	}, {
		key: '_getDx',
		value: function _getDx() {
			// Will be sharper if there is a pinch
			if (this.bottomPinch > 0) {
				return this.bottomLeftX / (this.data.length - this.bottomPinch);
			}

			return this.bottomLeftX / this.data.length;
		}

		/**
   * @return {Number}
   */
	}, {
		key: '_getDy',
		value: function _getDy() {
			// Curved chart needs reserved pixels to account for curvature
			if (this.isCurved) {
				return (this.height - this.curveHeight) / this.data.length;
			}

			return this.height / this.data.length;
		}

		/**
   * Draw the chart onto the DOM.
   *
   * @return {void}
   */
	}, {
		key: '_draw',
		value: function _draw() {
			// Add the SVG
			this.svg = d3.select(this.selector).append('svg').attr('width', this.width).attr('height', this.height);

			this.blockPaths = this._makePaths();

			// Define color gradients
			if (this.fillType === 'gradient') {
				this._defineColorGradients(this.svg);
			}

			// Add top oval if curved
			if (this.isCurved) {
				this._drawTopOval(this.svg, this.blockPaths);
			}

			// Add each block
			this._drawBlock(0);
		}

		/**
   * Create the paths to be used to define the discrete funnel blocks and
   * returns the results in an array.
   *
   * @return {Array}
   */
	}, {
		key: '_makePaths',
		value: function _makePaths() {
			var _this2 = this;

			var paths = [];

			// Initialize velocity
			var dx = this.dx;
			var dy = this.dy;

			// Initialize starting positions
			var prevLeftX = 0;
			var prevRightX = this.width;
			var prevHeight = 0;

			// Start from the bottom for inverted
			if (this.isInverted) {
				prevLeftX = this.bottomLeftX;
				prevRightX = this.width - this.bottomLeftX;
			}

			// Initialize next positions
			var nextLeftX = 0;
			var nextRightX = 0;
			var nextHeight = 0;

			var middle = this.width / 2;

			// Move down if there is an initial curve
			if (this.isCurved) {
				prevHeight = 10;
			}

			var topBase = this.width;
			var bottomBase = 0;

			var totalArea = this.height * (this.width + this.bottomWidth) / 2;
			var slope = 2 * this.height / (this.width - this.bottomWidth);

			// This is greedy in that the block will have a guaranteed height
			// and the remaining is shared among the ratio, instead of being
			// shared according to the remaining minus the guaranteed
			if (this.minHeight !== false) {
				totalArea = (this.height - this.minHeight * this.data.length) * (this.width + this.bottomWidth) / 2;
			}

			var totalCount = 0;
			var count = 0;

			// Harvest total count
			this.data.forEach(function (block) {
				totalCount += Array.isArray(block[1]) ? block[1][0] : block[1];
			});

			// Create the path definition for each funnel block
			// Remember to loop back to the beginning point for a closed path
			this.data.forEach(function (block, i) {
				count = Array.isArray(block[1]) ? block[0] : block[1];

				// Calculate dynamic shapes based on area
				if (_this2.dynamicArea) {
					var ratio = count / totalCount;
					var area = ratio * totalArea;

					if (_this2.minHeight !== false) {
						area += _this2.minHeight * (_this2.width + _this2.bottomWidth) / 2;
					}

					bottomBase = Math.sqrt((slope * topBase * topBase - 4 * area) / slope);
					dx = topBase / 2 - bottomBase / 2;
					dy = area * 2 / (topBase + bottomBase);

					if (_this2.isCurved) {
						dy = dy - _this2.curveHeight / _this2.data.length;
					}

					topBase = bottomBase;
				}

				// Stop velocity for pinched blocks
				if (_this2.bottomPinch > 0) {
					// Check if we've reached the bottom of the pinch
					// If so, stop changing on x
					if (!_this2.isInverted) {
						if (i >= _this2.data.length - _this2.bottomPinch) {
							dx = 0;
						}
						// Pinch at the first blocks relating to the bottom pinch
						// Revert back to normal velocity after pinch
					} else {
							// Revert velocity back to the initial if we are using
							// static area's (prevents zero velocity if isInverted
							// and bottomPinch are non trivial and dynamicArea is
							// false)
							if (!_this2.dynamicArea) {
								dx = _this2.dx;
							}

							dx = i < _this2.bottomPinch ? 0 : dx;
						}
				}

				// Calculate the position of next block
				nextLeftX = prevLeftX + dx;
				nextRightX = prevRightX - dx;
				nextHeight = prevHeight + dy;

				// Expand outward if inverted
				if (_this2.isInverted) {
					nextLeftX = prevLeftX - dx;
					nextRightX = prevRightX + dx;
				}

				// Plot curved lines
				if (_this2.isCurved) {
					paths.push([
					// Top Bezier curve
					[prevLeftX, prevHeight, 'M'], [middle, prevHeight + (_this2.curveHeight - 10), 'Q'], [prevRightX, prevHeight, ''],
					// Right line
					[nextRightX, nextHeight, 'L'],
					// Bottom Bezier curve
					[nextRightX, nextHeight, 'M'], [middle, nextHeight + _this2.curveHeight, 'Q'], [nextLeftX, nextHeight, ''],
					// Left line
					[prevLeftX, prevHeight, 'L']]);
					// Plot straight lines
				} else {
						paths.push([
						// Start position
						[prevLeftX, prevHeight, 'M'],
						// Move to right
						[prevRightX, prevHeight, 'L'],
						// Move down
						[nextRightX, nextHeight, 'L'],
						// Move to left
						[nextLeftX, nextHeight, 'L'],
						// Wrap back to top
						[prevLeftX, prevHeight, 'L']]);
					}

				// Set the next block's previous position
				prevLeftX = nextLeftX;
				prevRightX = nextRightX;
				prevHeight = nextHeight;
			});

			return paths;
		}

		/**
   * Define the linear color gradients.
   *
   * @param {Object} svg
   *
   * @return {void}
   */
	}, {
		key: '_defineColorGradients',
		value: function _defineColorGradients(svg) {
			var defs = svg.append('defs');

			// Create a gradient for each block
			this.data.forEach(function (block, index) {
				var color = block[2];
				var shade = Utils.shadeColor(color, -0.25);

				// Create linear gradient
				var gradient = defs.append('linearGradient').attr({
					id: 'gradient-' + index
				});

				// Define the gradient stops
				var stops = [[0, shade], [40, color], [60, color], [100, shade]];

				// Add the gradient stops
				stops.forEach(function (stop) {
					gradient.append('stop').attr({
						offset: stop[0] + '%',
						style: 'stop-color:' + stop[1]
					});
				});
			});
		}

		/**
   * Draw the top oval of a curved funnel.
   *
   * @param {Object} svg
   * @param {Array}  blockPaths
   *
   * @return {void}
   */
	}, {
		key: '_drawTopOval',
		value: function _drawTopOval(svg, blockPaths) {
			var leftX = 0;
			var rightX = this.width;
			var centerX = this.width / 2;

			if (this.isInverted) {
				leftX = this.bottomLeftX;
				rightX = this.width - this.bottomLeftX;
			}

			// Create path from top-most block
			var paths = blockPaths[0];
			var topCurve = paths[1][1] + this.curveHeight - 10;

			var path = this.navigator.plot([['M', leftX, paths[0][1]], ['Q', centerX, topCurve], [' ', rightX, paths[2][1]], ['M', rightX, 10], ['Q', centerX, 0], [' ', leftX, 10]]);

			// Draw top oval
			svg.append('path').attr('fill', Utils.shadeColor(this.data[0][2], -0.4)).attr('d', path);
		}

		/**
   * Draw the next block in the iteration.
   *
   * @param {int} index
   *
   * @return {void}
   */
	}, {
		key: '_drawBlock',
		value: function _drawBlock(index) {
			var _this3 = this;

			if (index === this.data.length) {
				return;
			}

			// Create a group just for this block
			var group = this.svg.append('g');

			// Fetch path element
			var path = this._getBlockPath(group, index);
			path.data(this._getBlockData(index));

			// Add animation components
			if (this.animation !== false) {
				path.transition().duration(this.animation).ease('linear').attr('fill', this._getColor(index)).attr('d', this._getPathDefinition(index)).each('end', function () {
					_this3._drawBlock(index + 1);
				});
			} else {
				path.attr('fill', this._getColor(index)).attr('d', this._getPathDefinition(index));
				this._drawBlock(index + 1);
			}

			// Add the hover events
			if (this.hoverEffects) {
				path.on('mouseover', this._onMouseOver).on('mouseout', this._onMouseOut);
			}

			// ItemClick event
			if (this.onItemClick !== null) {
				path.on('click', this.onItemClick);
			}

			this._addBlockLabel(group, index);
		}

		/**
   * @param {Object} group
   * @param {int}    index
   *
   * @return {Object}
   */
	}, {
		key: '_getBlockPath',
		value: function _getBlockPath(group, index) {
			var path = group.append('path');

			if (this.animation !== false) {
				this._addBeforeTransition(path, index);
			}

			return path;
		}

		/**
   * Set the attributes of a path element before its animation.
   *
   * @param {Object} path
   * @param {int}    index
   *
   * @return {void}
   */
	}, {
		key: '_addBeforeTransition',
		value: function _addBeforeTransition(path, index) {
			var paths = this.blockPaths[index];

			var beforePath = '';
			var beforeFill = '';

			// Construct the top of the trapezoid and leave the other elements
			// hovering around to expand downward on animation
			if (!this.isCurved) {
				beforePath = this.navigator.plot([['M', paths[0][0], paths[0][1]], ['L', paths[1][0], paths[1][1]], ['L', paths[1][0], paths[1][1]], ['L', paths[0][0], paths[0][1]]]);
			} else {
				beforePath = this.navigator.plot([['M', paths[0][0], paths[0][1]], ['Q', paths[1][0], paths[1][1]], [' ', paths[2][0], paths[2][1]], ['L', paths[2][0], paths[2][1]], ['M', paths[2][0], paths[2][1]], ['Q', paths[1][0], paths[1][1]], [' ', paths[0][0], paths[0][1]]]);
			}

			// Use previous fill color, if available
			if (this.fillType === 'solid') {
				beforeFill = index > 0 ? this._getColor(index - 1) : this._getColor(index);
				// Use current background if gradient (gradients do not transition)
			} else {
					beforeFill = this._getColor(index);
				}

			path.attr('d', beforePath).attr('fill', beforeFill);
		}

		/**
   * @param {int} index
   *
   * @return {Array}
   */
	}, {
		key: '_getBlockData',
		value: function _getBlockData(index) {
			var label = this.data[index][0];
			var value = this.data[index][1];

			return [{
				index: index,
				label: label,
				value: value,
				formatted: this.labelFormatter.format(label, value),
				baseColor: this.data[index][2],
				fill: this._getColor(index)
			}];
		}

		/**
   * Return the color for the given index.
   *
   * @param {int} index
   *
   * @return {string}
   */
	}, {
		key: '_getColor',
		value: function _getColor(index) {
			if (this.fillType === 'solid') {
				return this.data[index][2];
			} else {
				return 'url(#gradient-' + index + ')';
			}
		}

		/**
   * @param {int} index
   *
   * @return {string}
   */
	}, {
		key: '_getPathDefinition',
		value: function _getPathDefinition(index) {
			var commands = [];

			this.blockPaths[index].forEach(function (command) {
				commands.push([command[2], command[0], command[1]]);
			});

			return this.navigator.plot(commands);
		}

		/**
   * @param {Object} data
   *
   * @return {void}
   */
	}, {
		key: '_onMouseOver',
		value: function _onMouseOver(data) {
			d3.select(this).attr('fill', Utils.shadeColor(data.baseColor, -0.2));
		}

		/**
   * @param {Object} data
   *
   * @return {void}
   */
	}, {
		key: '_onMouseOut',
		value: function _onMouseOut(data) {
			d3.select(this).attr('fill', data.fill);
		}

		/**
   * @param {Object} group
   * @param {int}    index
   *
   * @return {void}
   */
	}, {
		key: '_addBlockLabel',
		value: function _addBlockLabel(group, index) {
			var paths = this.blockPaths[index];

			var label = this._getBlockData(index)[0].formatted;
			var fill = this.data[index][3] || this.label.fill;

			var x = this.width / 2; // Center the text
			var y = this._getTextY(paths);

			group.append('text').text(label).attr({
				'x': x,
				'y': y,
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'fill': fill,
				'pointer-events': 'none'
			}).style('font-size', this.label.fontSize);
		}

		/**
   * Returns the y position of the given label's text. This is determined by
   * taking the mean of the bases.
   *
   * @param {Array} paths
   *
   * @return {Number}
   */
	}, {
		key: '_getTextY',
		value: function _getTextY(paths) {
			if (this.isCurved) {
				return (paths[2][1] + paths[3][1]) / 2 + this.curveHeight / this.data.length;
			}

			return (paths[1][1] + paths[2][1]) / 2;
		}
	}]);

	return D3Funnel;
})();

var LabelFormatter = (function () {

	/**
  * Initial the formatter.
  *
  * @return {void}
  */

	function LabelFormatter() {
		_classCallCheck(this, LabelFormatter);

		this.expression = null;
	}

	/* exported Navigator */

	/**
  * Register the format function.
  *
  * @param {string|function} format
  *
  * @return {void}
  */

	_createClass(LabelFormatter, [{
		key: 'setFormat',
		value: function setFormat(format) {
			if (typeof format === 'function') {
				this.formatter = format;
			} else {
				this.expression = format;
				this.formatter = this.stringFormatter;
			}
		}

		/**
   * Format the given value according to the data point or the format.
   *
   * @param {string} label
   * @param {number} value
   *
   * @return string
   */
	}, {
		key: 'format',
		value: function format(label, value) {
			// Try to use any formatted value specified through the data
			// Otherwise, attempt to use the format function
			if (Array.isArray(value)) {
				return this.formatter(label, value[0], value[1]);
			} else {
				return this.formatter(label, value, null);
			}
		}

		/**
   * Format the string according to a simple expression.
   *
   * {l}: label
   * {v}: raw value
   * {f}: formatted value
   *
   * @param {string} label
   * @param {number} value
   * @param {*}      fValue
   *
   * @return {string}
   */
	}, {
		key: 'stringFormatter',
		value: function stringFormatter(label, value) {
			var fValue = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

			// Attempt to use supplied formatted value
			// Otherwise, use the default
			if (fValue === null) {
				fValue = this.getDefaultFormattedValue(value);
			}

			return this.expression.split('{l}').join(label).split('{v}').join(value).split('{f}').join(fValue);
		}

		/**
   * @param {number} value
   *
   * @return {string}
   */
	}, {
		key: 'getDefaultFormattedValue',
		value: function getDefaultFormattedValue(value) {
			return value.toLocaleString();
		}
	}]);

	return LabelFormatter;
})();

var Navigator = (function () {
	function Navigator() {
		_classCallCheck(this, Navigator);
	}

	/* exported Utils */
	/* jshint bitwise: false */

	/**
  * Simple utility class.
  */

	_createClass(Navigator, [{
		key: 'plot',

		/**
   * Given a list of path commands, returns the compiled description.
   *
   * @param {Array} commands
   *
   * @returns {string}
   */
		value: function plot(commands) {
			var path = '';

			commands.forEach(function (command) {
				path += command[0] + command[1] + ',' + command[2] + ' ';
			});

			return path.replace(/ +/g, ' ').trim();
		}
	}]);

	return Navigator;
})();

var Utils = (function () {
	function Utils() {
		_classCallCheck(this, Utils);
	}

	_createClass(Utils, null, [{
		key: 'extend',

		/**
   * Extends an object with the members of another.
   *
   * @param {Object} a The object to be extended.
   * @param {Object} b The object to clone from.
   *
   * @return {Object}
   */
		value: function extend(a, b) {
			var prop = undefined;

			for (prop in b) {
				if (b.hasOwnProperty(prop)) {
					if (typeof a[prop] === 'object' && typeof b[prop] === 'object') {
						a[prop] = Utils.extend(a[prop], b[prop]);
					} else {
						a[prop] = b[prop];
					}
				}
			}

			return a;
		}

		/**
   * Shade a color to the given percentage.
   *
   * @param {string} color A hex color.
   * @param {number} shade The shade adjustment. Can be positive or negative.
   *
   * @return {string}
   */
	}, {
		key: 'shadeColor',
		value: function shadeColor(color, shade) {
			var f = parseInt(color.slice(1), 16);
			var t = shade < 0 ? 0 : 255;
			var p = shade < 0 ? shade * -1 : shade;

			var R = f >> 16;
			var G = f >> 8 & 0x00FF;
			var B = f & 0x0000FF;

			var converted = 0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B);

			return '#' + converted.toString(16).slice(1);
		}
	}]);

	return Utils;
})();
return D3Funnel;

}));
