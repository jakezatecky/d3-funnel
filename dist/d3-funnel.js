(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("d3"));
	else if(typeof define === 'function' && define.amd)
		define(["d3"], factory);
	else if(typeof exports === 'object')
		exports["D3Funnel"] = factory(require("d3"));
	else
		root["D3Funnel"] = factory(root["d3"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Use CommonJS export to trick Webpack into working around the issues that
	// window.[module].default is set rather than window.[module]
	//
	// See: https://github.com/webpack/webpack/issues/706

	module.exports = __webpack_require__(1).default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _d = __webpack_require__(2);

	var _d2 = _interopRequireDefault(_d);

	var _colorizer = __webpack_require__(3);

	var _colorizer2 = _interopRequireDefault(_colorizer);

	var _labelFormatter = __webpack_require__(4);

	var _labelFormatter2 = _interopRequireDefault(_labelFormatter);

	var _navigator = __webpack_require__(5);

	var _navigator2 = _interopRequireDefault(_navigator);

	var _utils = __webpack_require__(6);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var D3Funnel = (function () {

		/**
	  * @param {string} selector A selector for the container element.
	  *
	  * @return {void}
	  */

		function D3Funnel(selector) {
			_classCallCheck(this, D3Funnel);

			this.selector = selector;

			this.colorizer = new _colorizer2.default();

			this.labelFormatter = new _labelFormatter2.default();

			this.navigator = new _navigator2.default();
		}

		/**
	  * Remove the funnel and its events from the DOM.
	  *
	  * @return {void}
	  */

		_createClass(D3Funnel, [{
			key: 'destroy',
			value: function destroy() {
				var container = _d2.default.select(this.selector);

				// D3's remove method appears to be sufficient for removing the events
				container.selectAll('svg').remove();

				// Remove other elements from container
				container.selectAll('*').remove();

				// Remove inner text from container
				container.text('');
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

				var settings = this._getSettings(options);

				// Set labels
				this.label = settings.label;
				this.labelFormatter.setFormat(this.label.format);

				// Set color scales
				this.colorizer.setLabelFill(settings.label.fill);
				this.colorizer.setScale(settings.block.fill.scale);

				// Initialize funnel chart settings
				this.width = settings.chart.width;
				this.height = settings.chart.height;
				this.bottomWidth = settings.chart.width * settings.chart.bottomWidth;
				this.bottomPinch = settings.chart.bottomPinch;
				this.isInverted = settings.chart.inverted;
				this.isCurved = settings.chart.curve.enabled;
				this.curveHeight = settings.chart.curve.height;
				this.fillType = settings.block.fill.type;
				this.hoverEffects = settings.block.highlight;
				this.dynamicHeight = settings.block.dynamicHeight;
				this.minHeight = settings.block.minHeight;
				this.animation = settings.chart.animate;

				// Support for events
				this.onBlockClick = settings.events.click.block;

				this._setBlocks(data);

				// Calculate the bottom left x position
				this.bottomLeftX = (this.width - this.bottomWidth) / 2;

				// Change in x direction
				this.dx = this._getDx();

				// Change in y direction
				this.dy = this._getDy();
			}

			/**
	   * @param {Array} data
	   *
	   * @return void
	   */

		}, {
			key: '_validateData',
			value: function _validateData(data) {
				if (Array.isArray(data) === false) {
					throw new Error('Data must be an array.');
				}

				if (data.length === 0) {
					throw new Error('Data array must contain at least one element.');
				}

				if (Array.isArray(data[0]) === false) {
					throw new Error('Data array elements must be arrays.');
				}

				if (data[0].length < 2) {
					throw new Error('Data array elements must contain a label and value.');
				}
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
				var settings = _utils2.default.extend({}, D3Funnel.defaults);
				settings.chart.width = parseInt(_d2.default.select(this.selector).style('width'), 10);
				settings.chart.height = parseInt(_d2.default.select(this.selector).style('height'), 10);

				// Overwrite default settings with user options
				settings = _utils2.default.extend(settings, options);

				// In the case that the width or height is not valid, set
				// the width/height as its default hard-coded value
				if (settings.chart.width <= 0) {
					settings.chart.width = D3Funnel.defaults.chart.width;
				}
				if (settings.chart.height <= 0) {
					settings.chart.height = D3Funnel.defaults.chart.height;
				}

				return settings;
			}

			/**
	   * Register the raw data into a standard block format and pre-calculate
	   * some values.
	   *
	   * @param {Array} data
	   *
	   * @return void
	   */

		}, {
			key: '_setBlocks',
			value: function _setBlocks(data) {
				var totalCount = this._getTotalCount(data);

				this.blocks = this._standardizeData(data, totalCount);
			}

			/**
	   * Return the total count of all blocks.
	   *
	   * @return {Number}
	   */

		}, {
			key: '_getTotalCount',
			value: function _getTotalCount(data) {
				var _this = this;

				var total = 0;

				data.forEach(function (block) {
					total += _this._getRawBlockCount(block);
				});

				return total;
			}

			/**
	   * Convert the raw data into a standardized format.
	   *
	   * @param {Array}  data
	   * @param {Number} totalCount
	   *
	   * @return {Array}
	   */

		}, {
			key: '_standardizeData',
			value: function _standardizeData(data, totalCount) {
				var _this2 = this;

				var standardized = [];

				var count = undefined;
				var ratio = undefined;
				var label = undefined;

				data.forEach(function (block, index) {
					count = _this2._getRawBlockCount(block);
					ratio = count / totalCount;
					label = block[0];

					standardized.push({
						index: index,
						ratio: ratio,
						value: count,
						height: _this2.height * ratio,
						fill: _this2.colorizer.getBlockFill(block, index, _this2.fillType),
						label: {
							raw: label,
							formatted: _this2.labelFormatter.format(label, count),
							color: _this2.colorizer.getLabelFill(block)
						}
					});
				});

				return standardized;
			}

			/**
	   * Given a raw data block, return its count.
	   *
	   * @param {Array} block
	   *
	   * @return {Number}
	   */

		}, {
			key: '_getRawBlockCount',
			value: function _getRawBlockCount(block) {
				return Array.isArray(block[1]) ? block[1][0] : block[1];
			}

			/**
	   * @return {Number}
	   */

		}, {
			key: '_getDx',
			value: function _getDx() {
				// Will be sharper if there is a pinch
				if (this.bottomPinch > 0) {
					return this.bottomLeftX / (this.blocks.length - this.bottomPinch);
				}

				return this.bottomLeftX / this.blocks.length;
			}

			/**
	   * @return {Number}
	   */

		}, {
			key: '_getDy',
			value: function _getDy() {
				// Curved chart needs reserved pixels to account for curvature
				if (this.isCurved) {
					return (this.height - this.curveHeight) / this.blocks.length;
				}

				return this.height / this.blocks.length;
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
				this.svg = _d2.default.select(this.selector).append('svg').attr('width', this.width).attr('height', this.height);

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
				var _this3 = this;

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

				var totalHeight = this.height;

				// This is greedy in that the block will have a guaranteed height
				// and the remaining is shared among the ratio, instead of being
				// shared according to the remaining minus the guaranteed
				if (this.minHeight !== 0) {
					totalHeight = this.height - this.minHeight * this.blocks.length;
				}

				var slopeHeight = this.height;

				// Correct slope height if there are blocks being pinched (and thus
				// requiring a sharper curve)
				this.blocks.forEach(function (block, i) {
					if (_this3.bottomPinch > 0) {
						if (_this3.isInverted) {
							if (i < _this3.bottomPinch) {
								slopeHeight -= block.height;
							}
						} else if (i >= _this3.blocks.length - _this3.bottomPinch) {
							slopeHeight -= block.height;
						}
					}
				});

				// The slope will determine the where the x points on each block
				// iteration
				var slope = 2 * slopeHeight / (this.width - this.bottomWidth);

				// Create the path definition for each funnel block
				// Remember to loop back to the beginning point for a closed path
				this.blocks.forEach(function (block, i) {
					// Make heights proportional to block weight
					if (_this3.dynamicHeight) {
						// Slice off the height proportional to this block
						dy = totalHeight * block.ratio;

						// Add greedy minimum height
						if (_this3.minHeight !== 0) {
							dy += _this3.minHeight;
						}

						// Account for any curvature
						if (_this3.isCurved) {
							dy = dy - _this3.curveHeight / _this3.blocks.length;
						}

						// Given: y = mx + b
						// Given: b = 0 (when funnel), b = this.height (when pyramid)
						// For funnel, x_i = y_i / slope
						nextLeftX = (prevHeight + dy) / slope;

						// For pyramid, x_i = y_i - this.height / -slope
						if (_this3.isInverted) {
							nextLeftX = (prevHeight + dy - _this3.height) / (-1 * slope);
						}

						// If bottomWidth is 0, adjust last x position (to circumvent
						// errors associated with rounding)
						if (_this3.bottomWidth === 0 && i === _this3.blocks.length - 1) {
							// For funnel, last position is the center
							nextLeftX = _this3.width / 2;

							// For pyramid, last position is the origin
							if (_this3.isInverted) {
								nextLeftX = 0;
							}
						}

						// If bottomWidth is same as width, stop x velocity
						if (_this3.bottomWidth === _this3.width) {
							nextLeftX = prevLeftX;
						}

						// Calculate the shift necessary for both x points
						dx = nextLeftX - prevLeftX;

						if (_this3.isInverted) {
							dx = prevLeftX - nextLeftX;
						}
					}

					// Stop velocity for pinched blocks
					if (_this3.bottomPinch > 0) {
						// Check if we've reached the bottom of the pinch
						// If so, stop changing on x
						if (!_this3.isInverted) {
							if (i >= _this3.blocks.length - _this3.bottomPinch) {
								dx = 0;
							}
							// Pinch at the first blocks relating to the bottom pinch
							// Revert back to normal velocity after pinch
						} else {
								// Revert velocity back to the initial if we are using
								// static area's (prevents zero velocity if isInverted
								// and bottomPinch are non trivial and dynamicHeight is
								// false)
								if (!_this3.dynamicHeight) {
									dx = _this3.dx;
								}

								dx = i < _this3.bottomPinch ? 0 : dx;
							}
					}

					// Calculate the position of next block
					nextLeftX = prevLeftX + dx;
					nextRightX = prevRightX - dx;
					nextHeight = prevHeight + dy;

					// Expand outward if inverted
					if (_this3.isInverted) {
						nextLeftX = prevLeftX - dx;
						nextRightX = prevRightX + dx;
					}

					// Plot curved lines
					if (_this3.isCurved) {
						paths.push([
						// Top Bezier curve
						[prevLeftX, prevHeight, 'M'], [middle, prevHeight + (_this3.curveHeight - 10), 'Q'], [prevRightX, prevHeight, ''],
						// Right line
						[nextRightX, nextHeight, 'L'],
						// Bottom Bezier curve
						[nextRightX, nextHeight, 'M'], [middle, nextHeight + _this3.curveHeight, 'Q'], [nextLeftX, nextHeight, ''],
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
				var _this4 = this;

				var defs = svg.append('defs');

				// Create a gradient for each block
				this.blocks.forEach(function (block, index) {
					var color = block.fill.raw;
					var shade = _this4.colorizer.shade(color, -0.2);

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
				svg.append('path').attr('fill', this.colorizer.shade(this.blocks[0].fill.raw, -0.4)).attr('d', path);
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
				var _this5 = this;

				if (index === this.blocks.length) {
					return;
				}

				// Create a group just for this block
				var group = this.svg.append('g');

				// Fetch path element
				var path = this._getBlockPath(group, index);

				// Attach data to the element
				this._attachData(path, this.blocks[index]);

				// Add animation components
				if (this.animation !== 0) {
					path.transition().duration(this.animation).ease('linear').attr('fill', this.blocks[index].fill.actual).attr('d', this._getPathDefinition(index)).each('end', function () {
						_this5._drawBlock(index + 1);
					});
				} else {
					path.attr('fill', this.blocks[index].fill.actual).attr('d', this._getPathDefinition(index));
					this._drawBlock(index + 1);
				}

				// Add the hover events
				if (this.hoverEffects) {
					path.on('mouseover', this._onMouseOver.bind(this)).on('mouseout', this._onMouseOut.bind(this));
				}

				// Add block click event
				if (this.onBlockClick !== null) {
					path.on('click', this.onBlockClick);
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

				if (this.animation !== 0) {
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
				if (this.fillType === 'solid' && index > 0) {
					beforeFill = this.blocks[index - 1].fill.actual;
					// Otherwise use current background
				} else {
						beforeFill = this.blocks[index].fill.actual;
					}

				path.attr('d', beforePath).attr('fill', beforeFill);
			}

			/**
	   * Attach data to the target element. Also attach the current node to the
	   * data object.
	   *
	   * @param {Object} element
	   *
	   * @return {void}
	   */

		}, {
			key: '_attachData',
			value: function _attachData(element, data) {
				data.node = element.node();

				element.data([data]);
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
				_d2.default.select(_d2.default.event.target).attr('fill', this.colorizer.shade(data.fill.raw, -0.2));
			}

			/**
	   * @param {Object} data
	   *
	   * @return {void}
	   */

		}, {
			key: '_onMouseOut',
			value: function _onMouseOut(data) {
				_d2.default.select(_d2.default.event.target).attr('fill', data.fill.actual);
			}

			/**
	   * @param {Object} group
	   * @param {int}    index
	   * @return {void}
	   */

		}, {
			key: '_addBlockLabel',
			value: function _addBlockLabel(group, index) {
				var paths = this.blockPaths[index];

				var text = this.blocks[index].label.formatted;
				var fill = this.blocks[index].label.color;

				var x = this.width / 2; // Center the text
				var y = this._getTextY(paths);

				group.append('text').text(text).attr({
					x: x,
					y: y,
					fill: fill,
					'text-anchor': 'middle',
					'dominant-baseline': 'middle',
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
					return (paths[2][1] + paths[3][1]) / 2 + this.curveHeight / this.blocks.length;
				}

				return (paths[1][1] + paths[2][1]) / 2;
			}
		}]);

		return D3Funnel;
	})();

	D3Funnel.defaults = {
		chart: {
			width: 350,
			height: 400,
			bottomWidth: 1 / 3,
			bottomPinch: 0,
			inverted: false,
			animate: 0,
			curve: {
				enabled: false,
				height: 20
			}
		},
		block: {
			dynamicHeight: false,
			fill: {
				scale: _d2.default.scale.category10().domain(_d2.default.range(0, 10)),
				type: 'solid'
			},
			minHeight: 0,
			highlight: false
		},
		label: {
			fontSize: '14px',
			fill: '#fff',
			format: '{l}: {f}'
		},
		events: {
			click: {
				block: null
			}
		}
	};
	exports.default = D3Funnel;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Colorizer = (function () {
		function Colorizer() {
			_classCallCheck(this, Colorizer);

			this.hexExpression = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

			this.labelFill = null;

			this.scale = null;
		}

		/**
	  * @param {string} fill
	  *
	  * @return {void}
	  */

		_createClass(Colorizer, [{
			key: 'setLabelFill',
			value: function setLabelFill(fill) {
				this.labelFill = fill;
			}

			/**
	   * @param {function|Array} scale
	   *
	   * @return {void}
	   */

		}, {
			key: 'setScale',
			value: function setScale(scale) {
				this.scale = scale;
			}

			/**
	   * Given a raw data block, return an appropriate color for the block.
	   *
	   * @param {Array}  block
	   * @param {Number} index
	   * @param {string} type
	   *
	   * @return {Object}
	   */

		}, {
			key: 'getBlockFill',
			value: function getBlockFill(block, index, type) {
				var raw = this.getBlockRawFill(block, index);

				return {
					raw: raw,
					actual: this.getBlockActualFill(raw, index, type)
				};
			}

			/**
	   * Return the raw hex color for the block.
	   *
	   * @param {Array}  block
	   * @param {Number} index
	   *
	   * @return {string}
	   */

		}, {
			key: 'getBlockRawFill',
			value: function getBlockRawFill(block, index) {
				// Use the block's color, if set and valid
				if (block.length > 2 && this.hexExpression.test(block[2])) {
					return block[2];
				}

				// Otherwise, attempt to use the array scale
				if (Array.isArray(this.scale)) {
					return this.scale[index];
				}

				// Finally, use a functional scale
				return this.scale(index);
			}

			/**
	   * Return the actual background for the block.
	   *
	   * @param {string} raw
	   * @param {Number} index
	   * @param {string} type
	   *
	   * @return {string}
	   */

		}, {
			key: 'getBlockActualFill',
			value: function getBlockActualFill(raw, index, type) {
				if (type === 'solid') {
					return raw;
				}

				return 'url(#gradient-' + index + ')';
			}

			/**
	   * Given a raw data block, return an appropriate label color.
	   *
	   * @param {Array} block
	   *
	   * @return {string}
	   */

		}, {
			key: 'getLabelFill',
			value: function getLabelFill(block) {
				// Use the label's color, if set and valid
				if (block.length > 3 && this.hexExpression.test(block[3])) {
					return block[3];
				}

				return this.labelFill;
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
			key: 'shade',
			value: function shade(color, _shade) {
				var hex = color.slice(1);

				if (hex.length === 3) {
					hex = this.expandHex(hex);
				}

				var f = parseInt(hex, 16);
				var t = _shade < 0 ? 0 : 255;
				var p = _shade < 0 ? _shade * -1 : _shade;

				var R = f >> 16;
				var G = f >> 8 & 0x00FF;
				var B = f & 0x0000FF;

				var converted = 0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B);

				return '#' + converted.toString(16).slice(1);
			}

			/**
	   * Expands a three character hex code to six characters.
	   *
	   * @param {string} hex
	   *
	   * @return {string}
	   */

		}, {
			key: 'expandHex',
			value: function expandHex(hex) {
				return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
			}
		}]);

		return Colorizer;
	})();

	exports.default = Colorizer;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
				}

				return this.formatter(label, value, null);
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

				var formatted = fValue;

				// Attempt to use supplied formatted value
				// Otherwise, use the default
				if (fValue === null) {
					formatted = this.getDefaultFormattedValue(value);
				}

				return this.expression.split('{l}').join(label).split('{v}').join(value).split('{f}').join(formatted);
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

	exports.default = LabelFormatter;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Navigator = (function () {
		function Navigator() {
			_classCallCheck(this, Navigator);
		}

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

	exports.default = Navigator;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
						if (_typeof(b[prop]) === 'object' && !Array.isArray(b[prop]) && b[prop] !== null) {
							if (_typeof(a[prop]) === 'object' && !Array.isArray(a[prop]) && b[prop] !== null) {
								a[prop] = Utils.extend(a[prop], b[prop]);
							} else {
								a[prop] = Utils.extend({}, b[prop]);
							}
						} else {
							a[prop] = b[prop];
						}
					}
				}

				return a;
			}
		}]);

		return Utils;
	})();

	exports.default = Utils;

/***/ }
/******/ ])
});
;