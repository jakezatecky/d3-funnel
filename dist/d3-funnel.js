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

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _d = __webpack_require__(2);

	var _d3Selection = __webpack_require__(3);

	__webpack_require__(4);

	var _Colorizer = __webpack_require__(11);

	var _Colorizer2 = _interopRequireDefault(_Colorizer);

	var _LabelFormatter = __webpack_require__(12);

	var _LabelFormatter2 = _interopRequireDefault(_LabelFormatter);

	var _Navigator = __webpack_require__(13);

	var _Navigator2 = _interopRequireDefault(_Navigator);

	var _Utils = __webpack_require__(14);

	var _Utils2 = _interopRequireDefault(_Utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var D3Funnel = function () {

		/**
	  * @param {string} selector A selector for the container element.
	  *
	  * @return {void}
	  */

		function D3Funnel(selector) {
			_classCallCheck(this, D3Funnel);

			this.selector = selector;

			this.colorizer = new _Colorizer2.default();
			this.labelFormatter = new _LabelFormatter2.default();
			this.navigator = new _Navigator2.default();

			this.id = null;
			this.autoId = 0;

			// Bind event handlers
			this.onMouseOver = this.onMouseOver.bind(this);
			this.onMouseOut = this.onMouseOut.bind(this);
		}

		/**
	  * Remove the funnel and its events from the DOM.
	  *
	  * @return {void}
	  */


		_createClass(D3Funnel, [{
			key: 'destroy',
			value: function destroy() {
				var container = (0, _d3Selection.select)(this.selector);

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

				this.initialize(data, options);

				this.drawOntoDom();
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
			key: 'initialize',
			value: function initialize(data, options) {
				this.validateData(data);

				var settings = this.getSettings(options);

				this.id = this.generateUniqueId();
				this.colorizer.setInstanceId(this.id);

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
				this.addValueOverlay = settings.block.barOverlay;
				this.curveHeight = settings.chart.curve.height;
				this.fillType = settings.block.fill.type;
				this.hoverEffects = settings.block.highlight;
				this.dynamicHeight = settings.block.dynamicHeight;
				this.dynamicSlope = settings.block.dynamicSlope;
				this.minHeight = settings.block.minHeight;
				this.animation = settings.chart.animate;
				this.totalCount = settings.chart.totalCount;

				// Support for events
				this.onBlockClick = settings.events.click.block;

				this.setBlocks(data);

				// Calculate the bottom left x position
				this.bottomLeftX = (this.width - this.bottomWidth) / 2;

				// Change in x direction
				this.dx = this.getDx();

				// Change in y direction
				this.dy = this.getDy();
			}

			/**
	   * @param {Array} data
	   *
	   * @return void
	   */

		}, {
			key: 'validateData',
			value: function validateData(data) {
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
	   * @return {Object}
	   */

		}, {
			key: 'getSettings',
			value: function getSettings(options) {
				var containerDimensions = this.getContainerDimensions();
				var defaults = this.getDefaultSettings(containerDimensions);

				// Prepare the configuration settings based on the defaults
				var settings = _Utils2.default.extend({}, defaults);

				// Override default settings with user options
				settings = _Utils2.default.extend(settings, options);

				// Account for any percentage-based dimensions
				settings.chart = _extends({}, settings.chart, this.castDimensions(settings, containerDimensions));

				return settings;
			}

			/**
	   * Return default settings.
	   *
	   * @param {Object} containerDimensions
	   *
	   * @return {Object}
	   */

		}, {
			key: 'getDefaultSettings',
			value: function getDefaultSettings(containerDimensions) {
				var settings = D3Funnel.defaults;

				// Set the default width and height based on the container
				settings.chart = _extends({}, settings.chart, containerDimensions);

				return settings;
			}

			/**
	   * Get the width/height dimensions of the container.
	   *
	   * @return {{width: Number, height: Number}}
	   */

		}, {
			key: 'getContainerDimensions',
			value: function getContainerDimensions() {
				return {
					width: parseFloat((0, _d3Selection.select)(this.selector).style('width')),
					height: parseFloat((0, _d3Selection.select)(this.selector).style('height'))
				};
			}

			/**
	   * Cast dimensions into tangible or meaningful numbers.
	   *
	   * @param {Object} chart
	   * @param {Object} containerDimensions
	   *
	   * @return {{width: Number, height: Number}}
	   */

		}, {
			key: 'castDimensions',
			value: function castDimensions(_ref, containerDimensions) {
				var chart = _ref.chart;

				var dimensions = {};

				['width', 'height'].forEach(function (direction) {
					var chartDimension = chart[direction];
					var containerDimension = containerDimensions[direction];

					if (/%$/.test(String(chartDimension))) {
						// Convert string into a percentage of the container
						dimensions[direction] = parseFloat(chartDimension) / 100 * containerDimension;
					} else if (chartDimension <= 0) {
						// If case of non-positive number, set to a usable number
						dimensions[direction] = D3Funnel.defaults.chart[direction];
					} else {
						dimensions[direction] = chartDimension;
					}
				});

				return dimensions;
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
			key: 'setBlocks',
			value: function setBlocks(data) {
				var totalCount = this.getTotalCount(data);

				this.blocks = this.standardizeData(data, totalCount);
			}

			/**
	   * Return the total count of all blocks.
	   *
	   * @param {Array} data
	   *
	   * @return {Number}
	   */

		}, {
			key: 'getTotalCount',
			value: function getTotalCount(data) {
				var _this = this;

				if (this.totalCount !== null) {
					return this.totalCount || 0;
				}

				var total = 0;

				data.forEach(function (block) {
					total += _this.getRawBlockCount(block);
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
			key: 'standardizeData',
			value: function standardizeData(data, totalCount) {
				var _this2 = this;

				var standardized = [];

				data.forEach(function (block, index) {
					var count = _this2.getRawBlockCount(block);
					var ratio = count / totalCount || 0;
					var label = block[0];

					standardized.push({
						index: index,
						ratio: ratio,
						value: count,
						height: _this2.height * ratio,
						fill: _this2.colorizer.getBlockFill(block, index, _this2.fillType),
						label: {
							raw: label,
							formatted: _this2.labelFormatter.format(label, block[1]),
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
			key: 'getRawBlockCount',
			value: function getRawBlockCount(block) {
				return Array.isArray(block[1]) ? block[1][0] : block[1];
			}

			/**
	   * @return {Number}
	   */

		}, {
			key: 'getDx',
			value: function getDx() {
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
			key: 'getDy',
			value: function getDy() {
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
			key: 'drawOntoDom',
			value: function drawOntoDom() {
				// Add the SVG
				this.svg = (0, _d3Selection.select)(this.selector).append('svg').attr('id', this.id).attr('width', this.width).attr('height', this.height);

				var newPaths = this.makePaths();
				this.blockPaths = newPaths[0];
				this.overlayPaths = newPaths[1];

				// Define color gradients
				if (this.fillType === 'gradient') {
					this.defineColorGradients(this.svg);
				}

				// Add top oval if curved
				if (this.isCurved) {
					this.drawTopOval(this.svg, this.blockPaths);
				}

				// Add each block
				this.drawBlock(0);
			}

			/**
	   * Return a unique ID for the funnel on the document.
	   *
	   * @return {string}
	   */

		}, {
			key: 'generateUniqueId',
			value: function generateUniqueId() {
				var findingId = true;
				var id = '';

				while (findingId) {
					id = 'd3-funnel-chart-' + this.autoId;

					if (document.getElementById(id) === null) {
						findingId = false;
					}

					this.autoId++;
				}

				return id;
			}

			/**
	   * Create the paths to be used to define the discrete funnel blocks and
	   * returns the results in an array.
	   *
	   * @return {Array, Array}
	   */

		}, {
			key: 'makePaths',
			value: function makePaths() {
				var _this3 = this;

				var paths = [];
				var overlayPaths = [];

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

				var centerX = this.width / 2;

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
							dy -= _this3.curveHeight / _this3.blocks.length;
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

					// Make slope width proportional to block value decrease
					if (_this3.dynamicSlope) {
						var nextBlockValue = _this3.blocks[i + 1] ? _this3.blocks[i + 1].value : block.value;

						var widthPercent = 1 - nextBlockValue / block.value;
						dx = widthPercent * (centerX - prevLeftX);
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

					var dimensions = {
						centerX: centerX,
						prevLeftX: prevLeftX,
						prevRightX: prevRightX,
						prevHeight: prevHeight,
						nextLeftX: nextLeftX,
						nextRightX: nextRightX,
						nextHeight: nextHeight,
						curveHeight: _this3.curveHeight,
						ratio: block.ratio
					};

					if (_this3.isCurved) {
						paths = [].concat(_toConsumableArray(paths), [_this3.navigator.makeCurvedPaths(dimensions)]);

						if (_this3.addValueOverlay) {
							overlayPaths = [].concat(_toConsumableArray(overlayPaths), [_this3.navigator.makeCurvedPaths(dimensions, true)]);
						}
					} else {
						paths = [].concat(_toConsumableArray(paths), [_this3.navigator.makeStraightPaths(dimensions)]);

						if (_this3.addValueOverlay) {
							overlayPaths = [].concat(_toConsumableArray(overlayPaths), [_this3.navigator.makeStraightPaths(dimensions, true)]);
						}
					}

					// Set the next block's previous position
					prevLeftX = nextLeftX;
					prevRightX = nextRightX;
					prevHeight = nextHeight;
				});

				return [paths, overlayPaths];
			}

			/**
	   * Define the linear color gradients.
	   *
	   * @param {Object} svg
	   *
	   * @return {void}
	   */

		}, {
			key: 'defineColorGradients',
			value: function defineColorGradients(svg) {
				var _this4 = this;

				var defs = svg.append('defs');

				// Create a gradient for each block
				this.blocks.forEach(function (block, index) {
					var color = block.fill.raw;
					var shade = _this4.colorizer.shade(color, -0.2);

					// Create linear gradient
					var gradient = defs.append('linearGradient').attr('id', _this4.colorizer.getGradientId(index));

					// Define the gradient stops
					var stops = [[0, shade], [40, color], [60, color], [100, shade]];

					// Add the gradient stops
					stops.forEach(function (stop) {
						gradient.append('stop').attrs({
							offset: stop[0] + '%',
							style: 'stop-color: ' + stop[1]
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
			key: 'drawTopOval',
			value: function drawTopOval(svg, blockPaths) {
				var leftX = 0;
				var rightX = this.width;
				var centerX = this.width / 2;

				if (this.isInverted) {
					leftX = this.bottomLeftX;
					rightX = this.width - this.bottomLeftX;
				}

				// Create path from top-most block
				var paths = blockPaths[0];
				var topCurve = paths[1][1] + (this.curveHeight - 10);

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
			key: 'drawBlock',
			value: function drawBlock(index) {
				var _this5 = this;

				if (index === this.blocks.length) {
					return;
				}

				// Create a group just for this block
				var group = this.svg.append('g');

				// Fetch path element
				var path = this.getBlockPath(group, index);

				// Attach data to the element
				this.attachData(path, this.blocks[index]);

				var overlayPath = null;
				var pathColor = this.blocks[index].fill.actual;

				if (this.addValueOverlay) {
					overlayPath = this.getOverlayPath(group, index);
					this.attachData(overlayPath, this.blocks[index]);

					// Add data attribute to distinguish between paths
					path.node().setAttribute('pathType', 'background');
					overlayPath.node().setAttribute('pathType', 'foreground');

					// Default path becomes background of lighter shade
					pathColor = this.colorizer.shade(this.blocks[index].fill.raw, 0.3);
				}

				// Add animation components
				if (this.animation !== 0) {
					path.transition().duration(this.animation).ease(_d.easeLinear).attr('fill', pathColor).attr('d', this.getPathDefinition(index)).on('end', function () {
						_this5.drawBlock(index + 1);
					});
				} else {
					path.attr('fill', pathColor).attr('d', this.getPathDefinition(index));
					this.drawBlock(index + 1);
				}

				// Add path overlay
				if (this.addValueOverlay) {
					path.attr('stroke', this.blocks[index].fill.raw);

					if (this.animation !== 0) {
						overlayPath.transition().duration(this.animation).ease(_d.easeLinear).attr('fill', this.blocks[index].fill.actual).attr('d', this.getOverlayPathDefinition(index));
					} else {
						overlayPath.attr('fill', this.blocks[index].fill.actual).attr('d', this.getOverlayPathDefinition(index));
					}
				}

				// Add the hover events
				if (this.hoverEffects) {
					[path, overlayPath].forEach(function (target) {
						if (!target) {
							return;
						}

						target.on('mouseover', _this5.onMouseOver).on('mouseout', _this5.onMouseOut);
					});
				}

				// Add block click event
				if (this.onBlockClick !== null) {
					[path, overlayPath].forEach(function (target) {
						if (!target) {
							return;
						}

						target.on('click', _this5.onBlockClick);
					});
				}

				this.addBlockLabel(group, index);
			}

			/**
	   * @param {Object} group
	   * @param {int}    index
	   *
	   * @return {Object}
	   */

		}, {
			key: 'getBlockPath',
			value: function getBlockPath(group, index) {
				var path = group.append('path');

				if (this.animation !== 0) {
					this.addBeforeTransition(path, index, false);
				}

				return path;
			}

			/**
	   * @param {Object} group
	   * @param {int}    index
	   *
	   * @return {Object}
	   */

		}, {
			key: 'getOverlayPath',
			value: function getOverlayPath(group, index) {
				var path = group.append('path');

				if (this.animation !== 0) {
					this.addBeforeTransition(path, index, true);
				}

				return path;
			}

			/**
	   * Set the attributes of a path element before its animation.
	   *
	   * @param {Object}  path
	   * @param {int}     index
	   * @param {boolean} isOverlay
	   *
	   * @return {void}
	   */

		}, {
			key: 'addBeforeTransition',
			value: function addBeforeTransition(path, index, isOverlay) {
				var paths = isOverlay ? this.overlayPaths[index] : this.blockPaths[index];

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
	   * @param {Object} data
	   *
	   * @return {void}
	   */

		}, {
			key: 'attachData',
			value: function attachData(element, data) {
				var nodeData = _extends({}, data, {
					node: element.node()
				});

				element.data([nodeData]);
			}

			/**
	   * @param {int} index
	   *
	   * @return {string}
	   */

		}, {
			key: 'getPathDefinition',
			value: function getPathDefinition(index) {
				var commands = [];

				this.blockPaths[index].forEach(function (command) {
					commands.push([command[2], command[0], command[1]]);
				});

				return this.navigator.plot(commands);
			}

			/**
	   * @param {int} index
	   *
	   * @return {string}
	   */

		}, {
			key: 'getOverlayPathDefinition',
			value: function getOverlayPathDefinition(index) {
				var commands = [];

				this.overlayPaths[index].forEach(function (command) {
					commands.push([command[2], command[0], command[1]]);
				});

				return this.navigator.plot(commands);
			}

			/**
	   * @param {Object} data
	   * @param {Number} groupIndex
	   * @param {Array} nodes
	   *
	   * @return {void}
	   */

		}, {
			key: 'onMouseOver',
			value: function onMouseOver(data, groupIndex, nodes) {
				var children = nodes[0].parentElement.childNodes;

				for (var i = 0; i < children.length; i++) {
					// Highlight all paths within one block
					var node = children[i];

					if (node.nodeName.toLowerCase() === 'path') {
						var type = node.getAttribute('pathType') || '';

						if (type === 'foreground') {
							(0, _d3Selection.select)(node).attr('fill', this.colorizer.shade(data.fill.raw, -0.5));
						} else {
							(0, _d3Selection.select)(node).attr('fill', this.colorizer.shade(data.fill.raw, -0.2));
						}
					}
				}
			}

			/**
	   * @param {Object} data
	   * @param {Number} groupIndex
	   * @param {Array} nodes
	   *
	   * @return {void}
	   */

		}, {
			key: 'onMouseOut',
			value: function onMouseOut(data, groupIndex, nodes) {
				var children = nodes[0].parentElement.childNodes;

				for (var i = 0; i < children.length; i++) {
					// Restore original color for all paths of a block
					var node = children[i];

					if (node.nodeName.toLowerCase() === 'path') {
						var type = node.getAttribute('pathType') || '';

						if (type === 'background') {
							var backgroundColor = this.colorizer.shade(data.fill.raw, 0.3);
							(0, _d3Selection.select)(node).attr('fill', backgroundColor);
						} else {
							(0, _d3Selection.select)(node).attr('fill', data.fill.actual);
						}
					}
				}
			}

			/**
	   * @param {Object} group
	   * @param {int}    index
	   *
	   * @return {void}
	   */

		}, {
			key: 'addBlockLabel',
			value: function addBlockLabel(group, index) {
				var paths = this.blockPaths[index];

				var formattedLabel = this.blocks[index].label.formatted;
				var fill = this.blocks[index].label.color;

				var x = this.width / 2; // Center the text
				var y = this.getTextY(paths);

				var text = group.append('text').attrs({
					x: x,
					y: y,
					fill: fill,
					'font-size': this.label.fontSize,
					'text-anchor': 'middle',
					'dominant-baseline': 'middle',
					'pointer-events': 'none'
				});

				// Add font-family, if exists
				if (this.label.fontFamily !== null) {
					text.attr('font-family', this.label.fontFamily);
				}

				this.addLabelLines(text, formattedLabel, x);
			}

			/**
	   * Add <tspan> elements for each line of the formatted label.
	   *
	   * @param {Object} text
	   * @param {String} formattedLabel
	   * @param {Number} x
	   *
	   * @return {void}
	   */

		}, {
			key: 'addLabelLines',
			value: function addLabelLines(text, formattedLabel, x) {
				var lines = formattedLabel.split('\n');
				var lineHeight = 20;

				// dy will signify the change from the initial height y
				// We need to initially start the first line at the very top, factoring
				// in the other number of lines
				var initialDy = -1 * lineHeight * (lines.length - 1) / 2;

				lines.forEach(function (line, i) {
					var dy = i === 0 ? initialDy : lineHeight;

					text.append('tspan').attrs({ x: x, dy: dy }).text(line);
				});
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
			key: 'getTextY',
			value: function getTextY(paths) {
				if (this.isCurved) {
					return (paths[2][1] + paths[3][1]) / 2 + this.curveHeight / this.blocks.length;
				}

				return (paths[1][1] + paths[2][1]) / 2;
			}
		}]);

		return D3Funnel;
	}();

	D3Funnel.defaults = {
		chart: {
			width: 350,
			height: 400,
			bottomWidth: 1 / 3,
			bottomPinch: 0,
			inverted: false,
			horizontal: false,
			animate: 0,
			curve: {
				enabled: false,
				height: 20
			},
			totalCount: null
		},
		block: {
			dynamicHeight: false,
			dynamicSlope: false,
			barOverlay: false,
			fill: {
				scale: (0, _d.scaleOrdinal)(_d.schemeCategory10).domain((0, _d.range)(0, 10)),
				type: 'solid'
			},
			minHeight: 0,
			highlight: false
		},
		label: {
			fontFamily: null,
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
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-selection/ Version 1.0.1. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.d3 = global.d3 || {})));
	}(this, function (exports) { 'use strict';

	  var xhtml = "http://www.w3.org/1999/xhtml";

	  var namespaces = {
	    svg: "http://www.w3.org/2000/svg",
	    xhtml: xhtml,
	    xlink: "http://www.w3.org/1999/xlink",
	    xml: "http://www.w3.org/XML/1998/namespace",
	    xmlns: "http://www.w3.org/2000/xmlns/"
	  };

	  function namespace(name) {
	    var prefix = name += "", i = prefix.indexOf(":");
	    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
	    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
	  }

	  function creatorInherit(name) {
	    return function() {
	      var document = this.ownerDocument,
	          uri = this.namespaceURI;
	      return uri === xhtml && document.documentElement.namespaceURI === xhtml
	          ? document.createElement(name)
	          : document.createElementNS(uri, name);
	    };
	  }

	  function creatorFixed(fullname) {
	    return function() {
	      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
	    };
	  }

	  function creator(name) {
	    var fullname = namespace(name);
	    return (fullname.local
	        ? creatorFixed
	        : creatorInherit)(fullname);
	  }

	  var nextId = 0;

	  function local() {
	    return new Local;
	  }

	  function Local() {
	    this._ = "@" + (++nextId).toString(36);
	  }

	  Local.prototype = local.prototype = {
	    constructor: Local,
	    get: function(node) {
	      var id = this._;
	      while (!(id in node)) if (!(node = node.parentNode)) return;
	      return node[id];
	    },
	    set: function(node, value) {
	      return node[this._] = value;
	    },
	    remove: function(node) {
	      return this._ in node && delete node[this._];
	    },
	    toString: function() {
	      return this._;
	    }
	  };

	  var matcher = function(selector) {
	    return function() {
	      return this.matches(selector);
	    };
	  };

	  if (typeof document !== "undefined") {
	    var element = document.documentElement;
	    if (!element.matches) {
	      var vendorMatches = element.webkitMatchesSelector
	          || element.msMatchesSelector
	          || element.mozMatchesSelector
	          || element.oMatchesSelector;
	      matcher = function(selector) {
	        return function() {
	          return vendorMatches.call(this, selector);
	        };
	      };
	    }
	  }

	  var matcher$1 = matcher;

	  var filterEvents = {};

	  exports.event = null;

	  if (typeof document !== "undefined") {
	    var element$1 = document.documentElement;
	    if (!("onmouseenter" in element$1)) {
	      filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
	    }
	  }

	  function filterContextListener(listener, index, group) {
	    listener = contextListener(listener, index, group);
	    return function(event) {
	      var related = event.relatedTarget;
	      if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
	        listener.call(this, event);
	      }
	    };
	  }

	  function contextListener(listener, index, group) {
	    return function(event1) {
	      var event0 = exports.event; // Events can be reentrant (e.g., focus).
	      exports.event = event1;
	      try {
	        listener.call(this, this.__data__, index, group);
	      } finally {
	        exports.event = event0;
	      }
	    };
	  }

	  function parseTypenames(typenames) {
	    return typenames.trim().split(/^|\s+/).map(function(t) {
	      var name = "", i = t.indexOf(".");
	      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
	      return {type: t, name: name};
	    });
	  }

	  function onRemove(typename) {
	    return function() {
	      var on = this.__on;
	      if (!on) return;
	      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
	        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
	          this.removeEventListener(o.type, o.listener, o.capture);
	        } else {
	          on[++i] = o;
	        }
	      }
	      if (++i) on.length = i;
	      else delete this.__on;
	    };
	  }

	  function onAdd(typename, value, capture) {
	    var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
	    return function(d, i, group) {
	      var on = this.__on, o, listener = wrap(value, i, group);
	      if (on) for (var j = 0, m = on.length; j < m; ++j) {
	        if ((o = on[j]).type === typename.type && o.name === typename.name) {
	          this.removeEventListener(o.type, o.listener, o.capture);
	          this.addEventListener(o.type, o.listener = listener, o.capture = capture);
	          o.value = value;
	          return;
	        }
	      }
	      this.addEventListener(typename.type, listener, capture);
	      o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
	      if (!on) this.__on = [o];
	      else on.push(o);
	    };
	  }

	  function selection_on(typename, value, capture) {
	    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

	    if (arguments.length < 2) {
	      var on = this.node().__on;
	      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
	        for (i = 0, o = on[j]; i < n; ++i) {
	          if ((t = typenames[i]).type === o.type && t.name === o.name) {
	            return o.value;
	          }
	        }
	      }
	      return;
	    }

	    on = value ? onAdd : onRemove;
	    if (capture == null) capture = false;
	    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
	    return this;
	  }

	  function customEvent(event1, listener, that, args) {
	    var event0 = exports.event;
	    event1.sourceEvent = exports.event;
	    exports.event = event1;
	    try {
	      return listener.apply(that, args);
	    } finally {
	      exports.event = event0;
	    }
	  }

	  function sourceEvent() {
	    var current = exports.event, source;
	    while (source = current.sourceEvent) current = source;
	    return current;
	  }

	  function point(node, event) {
	    var svg = node.ownerSVGElement || node;

	    if (svg.createSVGPoint) {
	      var point = svg.createSVGPoint();
	      point.x = event.clientX, point.y = event.clientY;
	      point = point.matrixTransform(node.getScreenCTM().inverse());
	      return [point.x, point.y];
	    }

	    var rect = node.getBoundingClientRect();
	    return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
	  }

	  function mouse(node) {
	    var event = sourceEvent();
	    if (event.changedTouches) event = event.changedTouches[0];
	    return point(node, event);
	  }

	  function none() {}

	  function selector(selector) {
	    return selector == null ? none : function() {
	      return this.querySelector(selector);
	    };
	  }

	  function selection_select(select) {
	    if (typeof select !== "function") select = selector(select);

	    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
	        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
	          if ("__data__" in node) subnode.__data__ = node.__data__;
	          subgroup[i] = subnode;
	        }
	      }
	    }

	    return new Selection(subgroups, this._parents);
	  }

	  function empty() {
	    return [];
	  }

	  function selectorAll(selector) {
	    return selector == null ? empty : function() {
	      return this.querySelectorAll(selector);
	    };
	  }

	  function selection_selectAll(select) {
	    if (typeof select !== "function") select = selectorAll(select);

	    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	        if (node = group[i]) {
	          subgroups.push(select.call(node, node.__data__, i, group));
	          parents.push(node);
	        }
	      }
	    }

	    return new Selection(subgroups, parents);
	  }

	  function selection_filter(match) {
	    if (typeof match !== "function") match = matcher$1(match);

	    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
	        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
	          subgroup.push(node);
	        }
	      }
	    }

	    return new Selection(subgroups, this._parents);
	  }

	  function sparse(update) {
	    return new Array(update.length);
	  }

	  function selection_enter() {
	    return new Selection(this._enter || this._groups.map(sparse), this._parents);
	  }

	  function EnterNode(parent, datum) {
	    this.ownerDocument = parent.ownerDocument;
	    this.namespaceURI = parent.namespaceURI;
	    this._next = null;
	    this._parent = parent;
	    this.__data__ = datum;
	  }

	  EnterNode.prototype = {
	    constructor: EnterNode,
	    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
	    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
	    querySelector: function(selector) { return this._parent.querySelector(selector); },
	    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
	  };

	  function constant(x) {
	    return function() {
	      return x;
	    };
	  }

	  var keyPrefix = "$"; // Protect against keys like “__proto__”.

	  function bindIndex(parent, group, enter, update, exit, data) {
	    var i = 0,
	        node,
	        groupLength = group.length,
	        dataLength = data.length;

	    // Put any non-null nodes that fit into update.
	    // Put any null nodes into enter.
	    // Put any remaining data into enter.
	    for (; i < dataLength; ++i) {
	      if (node = group[i]) {
	        node.__data__ = data[i];
	        update[i] = node;
	      } else {
	        enter[i] = new EnterNode(parent, data[i]);
	      }
	    }

	    // Put any non-null nodes that don’t fit into exit.
	    for (; i < groupLength; ++i) {
	      if (node = group[i]) {
	        exit[i] = node;
	      }
	    }
	  }

	  function bindKey(parent, group, enter, update, exit, data, key) {
	    var i,
	        node,
	        nodeByKeyValue = {},
	        groupLength = group.length,
	        dataLength = data.length,
	        keyValues = new Array(groupLength),
	        keyValue;

	    // Compute the key for each node.
	    // If multiple nodes have the same key, the duplicates are added to exit.
	    for (i = 0; i < groupLength; ++i) {
	      if (node = group[i]) {
	        keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
	        if (keyValue in nodeByKeyValue) {
	          exit[i] = node;
	        } else {
	          nodeByKeyValue[keyValue] = node;
	        }
	      }
	    }

	    // Compute the key for each datum.
	    // If there a node associated with this key, join and add it to update.
	    // If there is not (or the key is a duplicate), add it to enter.
	    for (i = 0; i < dataLength; ++i) {
	      keyValue = keyPrefix + key.call(parent, data[i], i, data);
	      if (node = nodeByKeyValue[keyValue]) {
	        update[i] = node;
	        node.__data__ = data[i];
	        nodeByKeyValue[keyValue] = null;
	      } else {
	        enter[i] = new EnterNode(parent, data[i]);
	      }
	    }

	    // Add any remaining nodes that were not bound to data to exit.
	    for (i = 0; i < groupLength; ++i) {
	      if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
	        exit[i] = node;
	      }
	    }
	  }

	  function selection_data(value, key) {
	    if (!value) {
	      data = new Array(this.size()), j = -1;
	      this.each(function(d) { data[++j] = d; });
	      return data;
	    }

	    var bind = key ? bindKey : bindIndex,
	        parents = this._parents,
	        groups = this._groups;

	    if (typeof value !== "function") value = constant(value);

	    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
	      var parent = parents[j],
	          group = groups[j],
	          groupLength = group.length,
	          data = value.call(parent, parent && parent.__data__, j, parents),
	          dataLength = data.length,
	          enterGroup = enter[j] = new Array(dataLength),
	          updateGroup = update[j] = new Array(dataLength),
	          exitGroup = exit[j] = new Array(groupLength);

	      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

	      // Now connect the enter nodes to their following update node, such that
	      // appendChild can insert the materialized enter node before this node,
	      // rather than at the end of the parent node.
	      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
	        if (previous = enterGroup[i0]) {
	          if (i0 >= i1) i1 = i0 + 1;
	          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
	          previous._next = next || null;
	        }
	      }
	    }

	    update = new Selection(update, parents);
	    update._enter = enter;
	    update._exit = exit;
	    return update;
	  }

	  function selection_exit() {
	    return new Selection(this._exit || this._groups.map(sparse), this._parents);
	  }

	  function selection_merge(selection) {

	    for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
	      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
	        if (node = group0[i] || group1[i]) {
	          merge[i] = node;
	        }
	      }
	    }

	    for (; j < m0; ++j) {
	      merges[j] = groups0[j];
	    }

	    return new Selection(merges, this._parents);
	  }

	  function selection_order() {

	    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
	      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
	        if (node = group[i]) {
	          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
	          next = node;
	        }
	      }
	    }

	    return this;
	  }

	  function selection_sort(compare) {
	    if (!compare) compare = ascending;

	    function compareNode(a, b) {
	      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
	    }

	    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
	        if (node = group[i]) {
	          sortgroup[i] = node;
	        }
	      }
	      sortgroup.sort(compareNode);
	    }

	    return new Selection(sortgroups, this._parents).order();
	  }

	  function ascending(a, b) {
	    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
	  }

	  function selection_call() {
	    var callback = arguments[0];
	    arguments[0] = this;
	    callback.apply(null, arguments);
	    return this;
	  }

	  function selection_nodes() {
	    var nodes = new Array(this.size()), i = -1;
	    this.each(function() { nodes[++i] = this; });
	    return nodes;
	  }

	  function selection_node() {

	    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
	      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
	        var node = group[i];
	        if (node) return node;
	      }
	    }

	    return null;
	  }

	  function selection_size() {
	    var size = 0;
	    this.each(function() { ++size; });
	    return size;
	  }

	  function selection_empty() {
	    return !this.node();
	  }

	  function selection_each(callback) {

	    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
	      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
	        if (node = group[i]) callback.call(node, node.__data__, i, group);
	      }
	    }

	    return this;
	  }

	  function attrRemove(name) {
	    return function() {
	      this.removeAttribute(name);
	    };
	  }

	  function attrRemoveNS(fullname) {
	    return function() {
	      this.removeAttributeNS(fullname.space, fullname.local);
	    };
	  }

	  function attrConstant(name, value) {
	    return function() {
	      this.setAttribute(name, value);
	    };
	  }

	  function attrConstantNS(fullname, value) {
	    return function() {
	      this.setAttributeNS(fullname.space, fullname.local, value);
	    };
	  }

	  function attrFunction(name, value) {
	    return function() {
	      var v = value.apply(this, arguments);
	      if (v == null) this.removeAttribute(name);
	      else this.setAttribute(name, v);
	    };
	  }

	  function attrFunctionNS(fullname, value) {
	    return function() {
	      var v = value.apply(this, arguments);
	      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
	      else this.setAttributeNS(fullname.space, fullname.local, v);
	    };
	  }

	  function selection_attr(name, value) {
	    var fullname = namespace(name);

	    if (arguments.length < 2) {
	      var node = this.node();
	      return fullname.local
	          ? node.getAttributeNS(fullname.space, fullname.local)
	          : node.getAttribute(fullname);
	    }

	    return this.each((value == null
	        ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
	        ? (fullname.local ? attrFunctionNS : attrFunction)
	        : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
	  }

	  function defaultView(node) {
	    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
	        || (node.document && node) // node is a Window
	        || node.defaultView; // node is a Document
	  }

	  function styleRemove(name) {
	    return function() {
	      this.style.removeProperty(name);
	    };
	  }

	  function styleConstant(name, value, priority) {
	    return function() {
	      this.style.setProperty(name, value, priority);
	    };
	  }

	  function styleFunction(name, value, priority) {
	    return function() {
	      var v = value.apply(this, arguments);
	      if (v == null) this.style.removeProperty(name);
	      else this.style.setProperty(name, v, priority);
	    };
	  }

	  function selection_style(name, value, priority) {
	    var node;
	    return arguments.length > 1
	        ? this.each((value == null
	              ? styleRemove : typeof value === "function"
	              ? styleFunction
	              : styleConstant)(name, value, priority == null ? "" : priority))
	        : defaultView(node = this.node())
	            .getComputedStyle(node, null)
	            .getPropertyValue(name);
	  }

	  function propertyRemove(name) {
	    return function() {
	      delete this[name];
	    };
	  }

	  function propertyConstant(name, value) {
	    return function() {
	      this[name] = value;
	    };
	  }

	  function propertyFunction(name, value) {
	    return function() {
	      var v = value.apply(this, arguments);
	      if (v == null) delete this[name];
	      else this[name] = v;
	    };
	  }

	  function selection_property(name, value) {
	    return arguments.length > 1
	        ? this.each((value == null
	            ? propertyRemove : typeof value === "function"
	            ? propertyFunction
	            : propertyConstant)(name, value))
	        : this.node()[name];
	  }

	  function classArray(string) {
	    return string.trim().split(/^|\s+/);
	  }

	  function classList(node) {
	    return node.classList || new ClassList(node);
	  }

	  function ClassList(node) {
	    this._node = node;
	    this._names = classArray(node.getAttribute("class") || "");
	  }

	  ClassList.prototype = {
	    add: function(name) {
	      var i = this._names.indexOf(name);
	      if (i < 0) {
	        this._names.push(name);
	        this._node.setAttribute("class", this._names.join(" "));
	      }
	    },
	    remove: function(name) {
	      var i = this._names.indexOf(name);
	      if (i >= 0) {
	        this._names.splice(i, 1);
	        this._node.setAttribute("class", this._names.join(" "));
	      }
	    },
	    contains: function(name) {
	      return this._names.indexOf(name) >= 0;
	    }
	  };

	  function classedAdd(node, names) {
	    var list = classList(node), i = -1, n = names.length;
	    while (++i < n) list.add(names[i]);
	  }

	  function classedRemove(node, names) {
	    var list = classList(node), i = -1, n = names.length;
	    while (++i < n) list.remove(names[i]);
	  }

	  function classedTrue(names) {
	    return function() {
	      classedAdd(this, names);
	    };
	  }

	  function classedFalse(names) {
	    return function() {
	      classedRemove(this, names);
	    };
	  }

	  function classedFunction(names, value) {
	    return function() {
	      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
	    };
	  }

	  function selection_classed(name, value) {
	    var names = classArray(name + "");

	    if (arguments.length < 2) {
	      var list = classList(this.node()), i = -1, n = names.length;
	      while (++i < n) if (!list.contains(names[i])) return false;
	      return true;
	    }

	    return this.each((typeof value === "function"
	        ? classedFunction : value
	        ? classedTrue
	        : classedFalse)(names, value));
	  }

	  function textRemove() {
	    this.textContent = "";
	  }

	  function textConstant(value) {
	    return function() {
	      this.textContent = value;
	    };
	  }

	  function textFunction(value) {
	    return function() {
	      var v = value.apply(this, arguments);
	      this.textContent = v == null ? "" : v;
	    };
	  }

	  function selection_text(value) {
	    return arguments.length
	        ? this.each(value == null
	            ? textRemove : (typeof value === "function"
	            ? textFunction
	            : textConstant)(value))
	        : this.node().textContent;
	  }

	  function htmlRemove() {
	    this.innerHTML = "";
	  }

	  function htmlConstant(value) {
	    return function() {
	      this.innerHTML = value;
	    };
	  }

	  function htmlFunction(value) {
	    return function() {
	      var v = value.apply(this, arguments);
	      this.innerHTML = v == null ? "" : v;
	    };
	  }

	  function selection_html(value) {
	    return arguments.length
	        ? this.each(value == null
	            ? htmlRemove : (typeof value === "function"
	            ? htmlFunction
	            : htmlConstant)(value))
	        : this.node().innerHTML;
	  }

	  function raise() {
	    if (this.nextSibling) this.parentNode.appendChild(this);
	  }

	  function selection_raise() {
	    return this.each(raise);
	  }

	  function lower() {
	    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
	  }

	  function selection_lower() {
	    return this.each(lower);
	  }

	  function selection_append(name) {
	    var create = typeof name === "function" ? name : creator(name);
	    return this.select(function() {
	      return this.appendChild(create.apply(this, arguments));
	    });
	  }

	  function constantNull() {
	    return null;
	  }

	  function selection_insert(name, before) {
	    var create = typeof name === "function" ? name : creator(name),
	        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
	    return this.select(function() {
	      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
	    });
	  }

	  function remove() {
	    var parent = this.parentNode;
	    if (parent) parent.removeChild(this);
	  }

	  function selection_remove() {
	    return this.each(remove);
	  }

	  function selection_datum(value) {
	    return arguments.length
	        ? this.property("__data__", value)
	        : this.node().__data__;
	  }

	  function dispatchEvent(node, type, params) {
	    var window = defaultView(node),
	        event = window.CustomEvent;

	    if (event) {
	      event = new event(type, params);
	    } else {
	      event = window.document.createEvent("Event");
	      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
	      else event.initEvent(type, false, false);
	    }

	    node.dispatchEvent(event);
	  }

	  function dispatchConstant(type, params) {
	    return function() {
	      return dispatchEvent(this, type, params);
	    };
	  }

	  function dispatchFunction(type, params) {
	    return function() {
	      return dispatchEvent(this, type, params.apply(this, arguments));
	    };
	  }

	  function selection_dispatch(type, params) {
	    return this.each((typeof params === "function"
	        ? dispatchFunction
	        : dispatchConstant)(type, params));
	  }

	  var root = [null];

	  function Selection(groups, parents) {
	    this._groups = groups;
	    this._parents = parents;
	  }

	  function selection() {
	    return new Selection([[document.documentElement]], root);
	  }

	  Selection.prototype = selection.prototype = {
	    constructor: Selection,
	    select: selection_select,
	    selectAll: selection_selectAll,
	    filter: selection_filter,
	    data: selection_data,
	    enter: selection_enter,
	    exit: selection_exit,
	    merge: selection_merge,
	    order: selection_order,
	    sort: selection_sort,
	    call: selection_call,
	    nodes: selection_nodes,
	    node: selection_node,
	    size: selection_size,
	    empty: selection_empty,
	    each: selection_each,
	    attr: selection_attr,
	    style: selection_style,
	    property: selection_property,
	    classed: selection_classed,
	    text: selection_text,
	    html: selection_html,
	    raise: selection_raise,
	    lower: selection_lower,
	    append: selection_append,
	    insert: selection_insert,
	    remove: selection_remove,
	    datum: selection_datum,
	    on: selection_on,
	    dispatch: selection_dispatch
	  };

	  function select(selector) {
	    return typeof selector === "string"
	        ? new Selection([[document.querySelector(selector)]], [document.documentElement])
	        : new Selection([[selector]], root);
	  }

	  function selectAll(selector) {
	    return typeof selector === "string"
	        ? new Selection([document.querySelectorAll(selector)], [document.documentElement])
	        : new Selection([selector == null ? [] : selector], root);
	  }

	  function touch(node, touches, identifier) {
	    if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

	    for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
	      if ((touch = touches[i]).identifier === identifier) {
	        return point(node, touch);
	      }
	    }

	    return null;
	  }

	  function touches(node, touches) {
	    if (touches == null) touches = sourceEvent().touches;

	    for (var i = 0, n = touches ? touches.length : 0, points = new Array(n); i < n; ++i) {
	      points[i] = point(node, touches[i]);
	    }

	    return points;
	  }

	  exports.creator = creator;
	  exports.local = local;
	  exports.matcher = matcher$1;
	  exports.mouse = mouse;
	  exports.namespace = namespace;
	  exports.namespaces = namespaces;
	  exports.select = select;
	  exports.selectAll = selectAll;
	  exports.selection = selection;
	  exports.selector = selector;
	  exports.selectorAll = selectorAll;
	  exports.touch = touch;
	  exports.touches = touches;
	  exports.window = defaultView;
	  exports.customEvent = customEvent;

	  Object.defineProperty(exports, '__esModule', { value: true });

	}));

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/d3/d3-selection-multi Version 1.0.0. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(__webpack_require__(3), __webpack_require__(5)) :
	  typeof define === 'function' && define.amd ? define(['d3-selection', 'd3-transition'], factory) :
	  (factory(global.d3,global.d3));
	}(this, function (d3Selection,d3Transition) { 'use strict';

	  function attrsFunction(selection, map) {
	    return selection.each(function() {
	      var x = map.apply(this, arguments), s = d3Selection.select(this);
	      for (var name in x) s.attr(name, x[name]);
	    });
	  }

	  function attrsObject(selection, map) {
	    for (var name in map) selection.attr(name, map[name]);
	    return selection;
	  }

	  function selection_attrs(map) {
	    return (typeof map === "function" ? attrsFunction : attrsObject)(this, map);
	  }

	  function stylesFunction(selection, map, priority) {
	    return selection.each(function() {
	      var x = map.apply(this, arguments), s = d3Selection.select(this);
	      for (var name in x) s.style(name, x[name], priority);
	    });
	  }

	  function stylesObject(selection, map, priority) {
	    for (var name in map) selection.style(name, map[name], priority);
	    return selection;
	  }

	  function selection_styles(map, priority) {
	    return (typeof map === "function" ? stylesFunction : stylesObject)(this, map, priority == null ? "" : priority);
	  }

	  function propertiesFunction(selection, map) {
	    return selection.each(function() {
	      var x = map.apply(this, arguments), s = d3Selection.select(this);
	      for (var name in x) s.property(name, x[name]);
	    });
	  }

	  function propertiesObject(selection, map) {
	    for (var name in map) selection.property(name, map[name]);
	    return selection;
	  }

	  function selection_properties(map) {
	    return (typeof map === "function" ? propertiesFunction : propertiesObject)(this, map);
	  }

	  function attrsFunction$1(transition, map) {
	    return transition.each(function() {
	      var x = map.apply(this, arguments), t = d3Selection.select(this).transition(transition);
	      for (var name in x) t.attr(name, x[name]);
	    });
	  }

	  function attrsObject$1(transition, map) {
	    for (var name in map) transition.attr(name, map[name]);
	    return transition;
	  }

	  function transition_attrs(map) {
	    return (typeof map === "function" ? attrsFunction$1 : attrsObject$1)(this, map);
	  }

	  function stylesFunction$1(transition, map, priority) {
	    return transition.each(function() {
	      var x = map.apply(this, arguments), t = d3Selection.select(this).transition(transition);
	      for (var name in x) t.style(name, x[name], priority);
	    });
	  }

	  function stylesObject$1(transition, map, priority) {
	    for (var name in map) transition.style(name, map[name], priority);
	    return transition;
	  }

	  function transition_styles(map, priority) {
	    return (typeof map === "function" ? stylesFunction$1 : stylesObject$1)(this, map, priority == null ? "" : priority);
	  }

	  d3Selection.selection.prototype.attrs = selection_attrs;
	  d3Selection.selection.prototype.styles = selection_styles;
	  d3Selection.selection.prototype.properties = selection_properties;
	  d3Transition.transition.prototype.attrs = transition_attrs;
	  d3Transition.transition.prototype.styles = transition_styles;

	}));

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-transition/ Version 1.0.0. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports, __webpack_require__(3), __webpack_require__(6), __webpack_require__(7), __webpack_require__(8), __webpack_require__(9), __webpack_require__(10)) :
	  typeof define === 'function' && define.amd ? define(['exports', 'd3-selection', 'd3-dispatch', 'd3-timer', 'd3-interpolate', 'd3-color', 'd3-ease'], factory) :
	  (factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3,global.d3,global.d3,global.d3));
	}(this, function (exports,d3Selection,d3Dispatch,d3Timer,d3Interpolate,d3Color,d3Ease) { 'use strict';

	  var emptyOn = d3Dispatch.dispatch("start", "end", "interrupt");
	  var emptyTween = [];

	  var CREATED = 0;
	  var SCHEDULED = 1;
	  var STARTING = 2;
	  var STARTED = 3;
	  var ENDING = 4;
	  var ENDED = 5;

	  function schedule(node, name, id, index, group, timing) {
	    var schedules = node.__transition;
	    if (!schedules) node.__transition = {};
	    else if (id in schedules) return;
	    create(node, id, {
	      name: name,
	      index: index, // For context during callback.
	      group: group, // For context during callback.
	      on: emptyOn,
	      tween: emptyTween,
	      time: timing.time,
	      delay: timing.delay,
	      duration: timing.duration,
	      ease: timing.ease,
	      timer: null,
	      state: CREATED
	    });
	  }

	  function init(node, id) {
	    var schedule = node.__transition;
	    if (!schedule || !(schedule = schedule[id]) || schedule.state > CREATED) throw new Error("too late");
	    return schedule;
	  }

	  function set(node, id) {
	    var schedule = node.__transition;
	    if (!schedule || !(schedule = schedule[id]) || schedule.state > STARTING) throw new Error("too late");
	    return schedule;
	  }

	  function get(node, id) {
	    var schedule = node.__transition;
	    if (!schedule || !(schedule = schedule[id])) throw new Error("too late");
	    return schedule;
	  }

	  function create(node, id, self) {
	    var schedules = node.__transition,
	        tween;

	    // Initialize the self timer when the transition is created.
	    // Note the actual delay is not known until the first callback!
	    schedules[id] = self;
	    self.timer = d3Timer.timer(schedule, 0, self.time);

	    // If the delay is greater than this first sleep, sleep some more;
	    // otherwise, start immediately.
	    function schedule(elapsed) {
	      self.state = SCHEDULED;
	      if (self.delay <= elapsed) start(elapsed - self.delay);
	      else self.timer.restart(start, self.delay, self.time);
	    }

	    function start(elapsed) {
	      var i, j, n, o;

	      for (i in schedules) {
	        o = schedules[i];
	        if (o.name !== self.name) continue;

	        // Interrupt the active transition, if any.
	        // Dispatch the interrupt event.
	        if (o.state === STARTED) {
	          o.state = ENDED;
	          o.timer.stop();
	          o.on.call("interrupt", node, node.__data__, o.index, o.group);
	          delete schedules[i];
	        }

	        // Cancel any pre-empted transitions. No interrupt event is dispatched
	        // because the cancelled transitions never started. Note that this also
	        // removes this transition from the pending list!
	        else if (+i < id) {
	          o.state = ENDED;
	          o.timer.stop();
	          delete schedules[i];
	        }
	      }

	      // Defer the first tick to end of the current frame; see mbostock/d3#1576.
	      // Note the transition may be canceled after start and before the first tick!
	      // Note this must be scheduled before the start event; see d3/d3-transition#16!
	      // Assuming this is successful, subsequent callbacks go straight to tick.
	      d3Timer.timeout(function() {
	        if (self.state === STARTED) {
	          self.timer.restart(tick, self.delay, self.time);
	          tick(elapsed);
	        }
	      });

	      // Dispatch the start event.
	      // Note this must be done before the tween are initialized.
	      self.state = STARTING;
	      self.on.call("start", node, node.__data__, self.index, self.group);
	      if (self.state !== STARTING) return; // interrupted
	      self.state = STARTED;

	      // Initialize the tween, deleting null tween.
	      tween = new Array(n = self.tween.length);
	      for (i = 0, j = -1; i < n; ++i) {
	        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
	          tween[++j] = o;
	        }
	      }
	      tween.length = j + 1;
	    }

	    function tick(elapsed) {
	      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.state = ENDING, 1),
	          i = -1,
	          n = tween.length;

	      while (++i < n) {
	        tween[i].call(null, t);
	      }

	      // Dispatch the end event.
	      if (self.state === ENDING) {
	        self.state = ENDED;
	        self.timer.stop();
	        self.on.call("end", node, node.__data__, self.index, self.group);
	        for (i in schedules) if (+i !== id) return void delete schedules[id];
	        delete node.__transition;
	      }
	    }
	  }

	  function interrupt(node, name) {
	    var schedules = node.__transition,
	        schedule,
	        active,
	        empty = true,
	        i;

	    if (!schedules) return;

	    name = name == null ? null : name + "";

	    for (i in schedules) {
	      if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
	      active = schedule.state === STARTED;
	      schedule.state = ENDED;
	      schedule.timer.stop();
	      if (active) schedule.on.call("interrupt", node, node.__data__, schedule.index, schedule.group);
	      delete schedules[i];
	    }

	    if (empty) delete node.__transition;
	  }

	  function selection_interrupt(name) {
	    return this.each(function() {
	      interrupt(this, name);
	    });
	  }

	  function tweenRemove(id, name) {
	    var tween0, tween1;
	    return function() {
	      var schedule = set(this, id),
	          tween = schedule.tween;

	      // If this node shared tween with the previous node,
	      // just assign the updated shared tween and we’re done!
	      // Otherwise, copy-on-write.
	      if (tween !== tween0) {
	        tween1 = tween0 = tween;
	        for (var i = 0, n = tween1.length; i < n; ++i) {
	          if (tween1[i].name === name) {
	            tween1 = tween1.slice();
	            tween1.splice(i, 1);
	            break;
	          }
	        }
	      }

	      schedule.tween = tween1;
	    };
	  }

	  function tweenFunction(id, name, value) {
	    var tween0, tween1;
	    if (typeof value !== "function") throw new Error;
	    return function() {
	      var schedule = set(this, id),
	          tween = schedule.tween;

	      // If this node shared tween with the previous node,
	      // just assign the updated shared tween and we’re done!
	      // Otherwise, copy-on-write.
	      if (tween !== tween0) {
	        tween1 = (tween0 = tween).slice();
	        for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
	          if (tween1[i].name === name) {
	            tween1[i] = t;
	            break;
	          }
	        }
	        if (i === n) tween1.push(t);
	      }

	      schedule.tween = tween1;
	    };
	  }

	  function transition_tween(name, value) {
	    var id = this._id;

	    name += "";

	    if (arguments.length < 2) {
	      var tween = get(this.node(), id).tween;
	      for (var i = 0, n = tween.length, t; i < n; ++i) {
	        if ((t = tween[i]).name === name) {
	          return t.value;
	        }
	      }
	      return null;
	    }

	    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
	  }

	  function tweenValue(transition, name, value) {
	    var id = transition._id;

	    transition.each(function() {
	      var schedule = set(this, id);
	      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
	    });

	    return function(node) {
	      return get(node, id).value[name];
	    };
	  }

	  function interpolate(a, b) {
	    var c;
	    return (typeof b === "number" ? d3Interpolate.interpolateNumber
	        : b instanceof d3Color.color ? d3Interpolate.interpolateRgb
	        : (c = d3Color.color(b)) ? (b = c, d3Interpolate.interpolateRgb)
	        : d3Interpolate.interpolateString)(a, b);
	  }

	  function attrRemove(name) {
	    return function() {
	      this.removeAttribute(name);
	    };
	  }

	  function attrRemoveNS(fullname) {
	    return function() {
	      this.removeAttributeNS(fullname.space, fullname.local);
	    };
	  }

	  function attrConstant(name, interpolate, value1) {
	    var value00,
	        interpolate0;
	    return function() {
	      var value0 = this.getAttribute(name);
	      return value0 === value1 ? null
	          : value0 === value00 ? interpolate0
	          : interpolate0 = interpolate(value00 = value0, value1);
	    };
	  }

	  function attrConstantNS(fullname, interpolate, value1) {
	    var value00,
	        interpolate0;
	    return function() {
	      var value0 = this.getAttributeNS(fullname.space, fullname.local);
	      return value0 === value1 ? null
	          : value0 === value00 ? interpolate0
	          : interpolate0 = interpolate(value00 = value0, value1);
	    };
	  }

	  function attrFunction(name, interpolate, value) {
	    var value00,
	        value10,
	        interpolate0;
	    return function() {
	      var value0, value1 = value(this);
	      if (value1 == null) return void this.removeAttribute(name);
	      value0 = this.getAttribute(name);
	      return value0 === value1 ? null
	          : value0 === value00 && value1 === value10 ? interpolate0
	          : interpolate0 = interpolate(value00 = value0, value10 = value1);
	    };
	  }

	  function attrFunctionNS(fullname, interpolate, value) {
	    var value00,
	        value10,
	        interpolate0;
	    return function() {
	      var value0, value1 = value(this);
	      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
	      value0 = this.getAttributeNS(fullname.space, fullname.local);
	      return value0 === value1 ? null
	          : value0 === value00 && value1 === value10 ? interpolate0
	          : interpolate0 = interpolate(value00 = value0, value10 = value1);
	    };
	  }

	  function transition_attr(name, value) {
	    var fullname = d3Selection.namespace(name), i = fullname === "transform" ? d3Interpolate.interpolateTransformSvg : interpolate;
	    return this.attrTween(name, typeof value === "function"
	        ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
	        : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
	        : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
	  }

	  function attrTweenNS(fullname, value) {
	    function tween() {
	      var node = this, i = value.apply(node, arguments);
	      return i && function(t) {
	        node.setAttributeNS(fullname.space, fullname.local, i(t));
	      };
	    }
	    tween._value = value;
	    return tween;
	  }

	  function attrTween(name, value) {
	    function tween() {
	      var node = this, i = value.apply(node, arguments);
	      return i && function(t) {
	        node.setAttribute(name, i(t));
	      };
	    }
	    tween._value = value;
	    return tween;
	  }

	  function transition_attrTween(name, value) {
	    var key = "attr." + name;
	    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
	    if (value == null) return this.tween(key, null);
	    if (typeof value !== "function") throw new Error;
	    var fullname = d3Selection.namespace(name);
	    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
	  }

	  function delayFunction(id, value) {
	    return function() {
	      init(this, id).delay = +value.apply(this, arguments);
	    };
	  }

	  function delayConstant(id, value) {
	    return value = +value, function() {
	      init(this, id).delay = value;
	    };
	  }

	  function transition_delay(value) {
	    var id = this._id;

	    return arguments.length
	        ? this.each((typeof value === "function"
	            ? delayFunction
	            : delayConstant)(id, value))
	        : get(this.node(), id).delay;
	  }

	  function durationFunction(id, value) {
	    return function() {
	      set(this, id).duration = +value.apply(this, arguments);
	    };
	  }

	  function durationConstant(id, value) {
	    return value = +value, function() {
	      set(this, id).duration = value;
	    };
	  }

	  function transition_duration(value) {
	    var id = this._id;

	    return arguments.length
	        ? this.each((typeof value === "function"
	            ? durationFunction
	            : durationConstant)(id, value))
	        : get(this.node(), id).duration;
	  }

	  function easeConstant(id, value) {
	    if (typeof value !== "function") throw new Error;
	    return function() {
	      set(this, id).ease = value;
	    };
	  }

	  function transition_ease(value) {
	    var id = this._id;

	    return arguments.length
	        ? this.each(easeConstant(id, value))
	        : get(this.node(), id).ease;
	  }

	  function transition_filter(match) {
	    if (typeof match !== "function") match = d3Selection.matcher(match);

	    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
	        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
	          subgroup.push(node);
	        }
	      }
	    }

	    return new Transition(subgroups, this._parents, this._name, this._id);
	  }

	  function transition_merge(transition) {
	    if (transition._id !== this._id) throw new Error;

	    for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
	      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
	        if (node = group0[i] || group1[i]) {
	          merge[i] = node;
	        }
	      }
	    }

	    for (; j < m0; ++j) {
	      merges[j] = groups0[j];
	    }

	    return new Transition(merges, this._parents, this._name, this._id);
	  }

	  function start(name) {
	    return (name + "").trim().split(/^|\s+/).every(function(t) {
	      var i = t.indexOf(".");
	      if (i >= 0) t = t.slice(0, i);
	      return !t || t === "start";
	    });
	  }

	  function onFunction(id, name, listener) {
	    var on0, on1, sit = start(name) ? init : set;
	    return function() {
	      var schedule = sit(this, id),
	          on = schedule.on;

	      // If this node shared a dispatch with the previous node,
	      // just assign the updated shared dispatch and we’re done!
	      // Otherwise, copy-on-write.
	      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

	      schedule.on = on1;
	    };
	  }

	  function transition_on(name, listener) {
	    var id = this._id;

	    return arguments.length < 2
	        ? get(this.node(), id).on.on(name)
	        : this.each(onFunction(id, name, listener));
	  }

	  function removeFunction(id) {
	    return function() {
	      var parent = this.parentNode;
	      for (var i in this.__transition) if (+i !== id) return;
	      if (parent) parent.removeChild(this);
	    };
	  }

	  function transition_remove() {
	    return this.on("end.remove", removeFunction(this._id));
	  }

	  function transition_select(select) {
	    var name = this._name,
	        id = this._id;

	    if (typeof select !== "function") select = d3Selection.selector(select);

	    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
	        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
	          if ("__data__" in node) subnode.__data__ = node.__data__;
	          subgroup[i] = subnode;
	          schedule(subgroup[i], name, id, i, subgroup, get(node, id));
	        }
	      }
	    }

	    return new Transition(subgroups, this._parents, name, id);
	  }

	  function transition_selectAll(select) {
	    var name = this._name,
	        id = this._id;

	    if (typeof select !== "function") select = d3Selection.selectorAll(select);

	    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	        if (node = group[i]) {
	          for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
	            if (child = children[k]) {
	              schedule(child, name, id, k, children, inherit);
	            }
	          }
	          subgroups.push(children);
	          parents.push(node);
	        }
	      }
	    }

	    return new Transition(subgroups, parents, name, id);
	  }

	  var Selection = d3Selection.selection.prototype.constructor;

	  function transition_selection() {
	    return new Selection(this._groups, this._parents);
	  }

	  function styleRemove(name, interpolate) {
	    var value00,
	        value10,
	        interpolate0;
	    return function() {
	      var style = d3Selection.window(this).getComputedStyle(this, null),
	          value0 = style.getPropertyValue(name),
	          value1 = (this.style.removeProperty(name), style.getPropertyValue(name));
	      return value0 === value1 ? null
	          : value0 === value00 && value1 === value10 ? interpolate0
	          : interpolate0 = interpolate(value00 = value0, value10 = value1);
	    };
	  }

	  function styleRemoveEnd(name) {
	    return function() {
	      this.style.removeProperty(name);
	    };
	  }

	  function styleConstant(name, interpolate, value1) {
	    var value00,
	        interpolate0;
	    return function() {
	      var value0 = d3Selection.window(this).getComputedStyle(this, null).getPropertyValue(name);
	      return value0 === value1 ? null
	          : value0 === value00 ? interpolate0
	          : interpolate0 = interpolate(value00 = value0, value1);
	    };
	  }

	  function styleFunction(name, interpolate, value) {
	    var value00,
	        value10,
	        interpolate0;
	    return function() {
	      var style = d3Selection.window(this).getComputedStyle(this, null),
	          value0 = style.getPropertyValue(name),
	          value1 = value(this);
	      if (value1 == null) value1 = (this.style.removeProperty(name), style.getPropertyValue(name));
	      return value0 === value1 ? null
	          : value0 === value00 && value1 === value10 ? interpolate0
	          : interpolate0 = interpolate(value00 = value0, value10 = value1);
	    };
	  }

	  function transition_style(name, value, priority) {
	    var i = (name += "") === "transform" ? d3Interpolate.interpolateTransformCss : interpolate;
	    return value == null ? this
	            .styleTween(name, styleRemove(name, i))
	            .on("end.style." + name, styleRemoveEnd(name))
	        : this.styleTween(name, typeof value === "function"
	            ? styleFunction(name, i, tweenValue(this, "style." + name, value))
	            : styleConstant(name, i, value), priority);
	  }

	  function styleTween(name, value, priority) {
	    function tween() {
	      var node = this, i = value.apply(node, arguments);
	      return i && function(t) {
	        node.style.setProperty(name, i(t), priority);
	      };
	    }
	    tween._value = value;
	    return tween;
	  }

	  function transition_styleTween(name, value, priority) {
	    var key = "style." + (name += "");
	    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
	    if (value == null) return this.tween(key, null);
	    if (typeof value !== "function") throw new Error;
	    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
	  }

	  function textConstant(value) {
	    return function() {
	      this.textContent = value;
	    };
	  }

	  function textFunction(value) {
	    return function() {
	      var value1 = value(this);
	      this.textContent = value1 == null ? "" : value1;
	    };
	  }

	  function transition_text(value) {
	    return this.tween("text", typeof value === "function"
	        ? textFunction(tweenValue(this, "text", value))
	        : textConstant(value == null ? "" : value + ""));
	  }

	  function transition_transition() {
	    var name = this._name,
	        id0 = this._id,
	        id1 = newId();

	    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	        if (node = group[i]) {
	          var inherit = get(node, id0);
	          schedule(node, name, id1, i, group, {
	            time: inherit.time + inherit.delay + inherit.duration,
	            delay: 0,
	            duration: inherit.duration,
	            ease: inherit.ease
	          });
	        }
	      }
	    }

	    return new Transition(groups, this._parents, name, id1);
	  }

	  var id = 0;

	  function Transition(groups, parents, name, id) {
	    this._groups = groups;
	    this._parents = parents;
	    this._name = name;
	    this._id = id;
	  }

	  function transition(name) {
	    return d3Selection.selection().transition(name);
	  }

	  function newId() {
	    return ++id;
	  }

	  var selection_prototype = d3Selection.selection.prototype;

	  Transition.prototype = transition.prototype = {
	    constructor: Transition,
	    select: transition_select,
	    selectAll: transition_selectAll,
	    filter: transition_filter,
	    merge: transition_merge,
	    selection: transition_selection,
	    transition: transition_transition,
	    call: selection_prototype.call,
	    nodes: selection_prototype.nodes,
	    node: selection_prototype.node,
	    size: selection_prototype.size,
	    empty: selection_prototype.empty,
	    each: selection_prototype.each,
	    on: transition_on,
	    attr: transition_attr,
	    attrTween: transition_attrTween,
	    style: transition_style,
	    styleTween: transition_styleTween,
	    text: transition_text,
	    remove: transition_remove,
	    tween: transition_tween,
	    delay: transition_delay,
	    duration: transition_duration,
	    ease: transition_ease
	  };

	  var defaultTiming = {
	    time: null, // Set on use.
	    delay: 0,
	    duration: 250,
	    ease: d3Ease.easeCubicInOut
	  };

	  function inherit(node, id) {
	    var timing;
	    while (!(timing = node.__transition) || !(timing = timing[id])) {
	      if (!(node = node.parentNode)) {
	        return defaultTiming.time = d3Timer.now(), defaultTiming;
	      }
	    }
	    return timing;
	  }

	  function selection_transition(name) {
	    var id,
	        timing;

	    if (name instanceof Transition) {
	      id = name._id, name = name._name;
	    } else {
	      id = newId(), (timing = defaultTiming).time = d3Timer.now(), name = name == null ? null : name + "";
	    }

	    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
	      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
	        if (node = group[i]) {
	          schedule(node, name, id, i, group, timing || inherit(node, id));
	        }
	      }
	    }

	    return new Transition(groups, this._parents, name, id);
	  }

	  d3Selection.selection.prototype.interrupt = selection_interrupt;
	  d3Selection.selection.prototype.transition = selection_transition;

	  var root = [null];

	  function active(node, name) {
	    var schedules = node.__transition,
	        schedule,
	        i;

	    if (schedules) {
	      name = name == null ? null : name + "";
	      for (i in schedules) {
	        if ((schedule = schedules[i]).state > SCHEDULED && schedule.name === name) {
	          return new Transition([[node]], root, name, +i);
	        }
	      }
	    }

	    return null;
	  }

	  exports.transition = transition;
	  exports.active = active;
	  exports.interrupt = interrupt;

	  Object.defineProperty(exports, '__esModule', { value: true });

	}));

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-dispatch/ Version 1.0.0. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.d3 = global.d3 || {})));
	}(this, function (exports) { 'use strict';

	  var noop = {value: function() {}};

	  function dispatch() {
	    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
	      if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
	      _[t] = [];
	    }
	    return new Dispatch(_);
	  }

	  function Dispatch(_) {
	    this._ = _;
	  }

	  function parseTypenames(typenames, types) {
	    return typenames.trim().split(/^|\s+/).map(function(t) {
	      var name = "", i = t.indexOf(".");
	      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
	      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
	      return {type: t, name: name};
	    });
	  }

	  Dispatch.prototype = dispatch.prototype = {
	    constructor: Dispatch,
	    on: function(typename, callback) {
	      var _ = this._,
	          T = parseTypenames(typename + "", _),
	          t,
	          i = -1,
	          n = T.length;

	      // If no callback was specified, return the callback of the given type and name.
	      if (arguments.length < 2) {
	        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
	        return;
	      }

	      // If a type was specified, set the callback for the given type and name.
	      // Otherwise, if a null callback was specified, remove callbacks of the given name.
	      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
	      while (++i < n) {
	        if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
	        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
	      }

	      return this;
	    },
	    copy: function() {
	      var copy = {}, _ = this._;
	      for (var t in _) copy[t] = _[t].slice();
	      return new Dispatch(copy);
	    },
	    call: function(type, that) {
	      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
	      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
	      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	    },
	    apply: function(type, that, args) {
	      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
	      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
	    }
	  };

	  function get(type, name) {
	    for (var i = 0, n = type.length, c; i < n; ++i) {
	      if ((c = type[i]).name === name) {
	        return c.value;
	      }
	    }
	  }

	  function set(type, name, callback) {
	    for (var i = 0, n = type.length; i < n; ++i) {
	      if (type[i].name === name) {
	        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
	        break;
	      }
	    }
	    if (callback != null) type.push({name: name, value: callback});
	    return type;
	  }

	  exports.dispatch = dispatch;

	  Object.defineProperty(exports, '__esModule', { value: true });

	}));

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-timer/ Version 1.0.1. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.d3 = global.d3 || {})));
	}(this, function (exports) { 'use strict';

	  var frame = 0;
	  var timeout = 0;
	  var interval = 0;
	  var pokeDelay = 1000;
	  var taskHead;
	  var taskTail;
	  var clockLast = 0;
	  var clockNow = 0;
	  var clockSkew = 0;
	  var clock = typeof performance === "object" && performance.now ? performance : Date;
	  var setFrame = typeof requestAnimationFrame === "function"
	          ? (clock === Date ? function(f) { requestAnimationFrame(function() { f(clock.now()); }); } : requestAnimationFrame)
	          : function(f) { setTimeout(f, 17); };
	  function now() {
	    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
	  }

	  function clearNow() {
	    clockNow = 0;
	  }

	  function Timer() {
	    this._call =
	    this._time =
	    this._next = null;
	  }

	  Timer.prototype = timer.prototype = {
	    constructor: Timer,
	    restart: function(callback, delay, time) {
	      if (typeof callback !== "function") throw new TypeError("callback is not a function");
	      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
	      if (!this._next && taskTail !== this) {
	        if (taskTail) taskTail._next = this;
	        else taskHead = this;
	        taskTail = this;
	      }
	      this._call = callback;
	      this._time = time;
	      sleep();
	    },
	    stop: function() {
	      if (this._call) {
	        this._call = null;
	        this._time = Infinity;
	        sleep();
	      }
	    }
	  };

	  function timer(callback, delay, time) {
	    var t = new Timer;
	    t.restart(callback, delay, time);
	    return t;
	  }

	  function timerFlush() {
	    now(); // Get the current time, if not already set.
	    ++frame; // Pretend we’ve set an alarm, if we haven’t already.
	    var t = taskHead, e;
	    while (t) {
	      if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
	      t = t._next;
	    }
	    --frame;
	  }

	  function wake(time) {
	    clockNow = (clockLast = time || clock.now()) + clockSkew;
	    frame = timeout = 0;
	    try {
	      timerFlush();
	    } finally {
	      frame = 0;
	      nap();
	      clockNow = 0;
	    }
	  }

	  function poke() {
	    var now = clock.now(), delay = now - clockLast;
	    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
	  }

	  function nap() {
	    var t0, t1 = taskHead, t2, time = Infinity;
	    while (t1) {
	      if (t1._call) {
	        if (time > t1._time) time = t1._time;
	        t0 = t1, t1 = t1._next;
	      } else {
	        t2 = t1._next, t1._next = null;
	        t1 = t0 ? t0._next = t2 : taskHead = t2;
	      }
	    }
	    taskTail = t0;
	    sleep(time);
	  }

	  function sleep(time) {
	    if (frame) return; // Soonest alarm already set, or will be.
	    if (timeout) timeout = clearTimeout(timeout);
	    var delay = time - clockNow;
	    if (delay > 24) {
	      if (time < Infinity) timeout = setTimeout(wake, delay);
	      if (interval) interval = clearInterval(interval);
	    } else {
	      if (!interval) interval = setInterval(poke, pokeDelay);
	      frame = 1, setFrame(wake);
	    }
	  }

	  function timeout$1(callback, delay, time) {
	    var t = new Timer;
	    delay = delay == null ? 0 : +delay;
	    t.restart(function(elapsed) {
	      t.stop();
	      callback(elapsed + delay);
	    }, delay, time);
	    return t;
	  }

	  function interval$1(callback, delay, time) {
	    var t = new Timer, total = delay;
	    if (delay == null) return t.restart(callback, delay, time), t;
	    delay = +delay, time = time == null ? now() : +time;
	    t.restart(function tick(elapsed) {
	      elapsed += total;
	      t.restart(tick, total += delay, time);
	      callback(elapsed);
	    }, delay, time);
	    return t;
	  }

	  exports.now = now;
	  exports.timer = timer;
	  exports.timerFlush = timerFlush;
	  exports.timeout = timeout$1;
	  exports.interval = interval$1;

	  Object.defineProperty(exports, '__esModule', { value: true });

	}));

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-interpolate/ Version 1.1.0. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports, __webpack_require__(9)) :
	  typeof define === 'function' && define.amd ? define(['exports', 'd3-color'], factory) :
	  (factory((global.d3 = global.d3 || {}),global.d3));
	}(this, function (exports,d3Color) { 'use strict';

	  function basis(t1, v0, v1, v2, v3) {
	    var t2 = t1 * t1, t3 = t2 * t1;
	    return ((1 - 3 * t1 + 3 * t2 - t3) * v0
	        + (4 - 6 * t2 + 3 * t3) * v1
	        + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
	        + t3 * v3) / 6;
	  }

	  function basis$1(values) {
	    var n = values.length - 1;
	    return function(t) {
	      var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
	          v1 = values[i],
	          v2 = values[i + 1],
	          v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
	          v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
	      return basis((t - i / n) * n, v0, v1, v2, v3);
	    };
	  }

	  function basisClosed(values) {
	    var n = values.length;
	    return function(t) {
	      var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n),
	          v0 = values[(i + n - 1) % n],
	          v1 = values[i % n],
	          v2 = values[(i + 1) % n],
	          v3 = values[(i + 2) % n];
	      return basis((t - i / n) * n, v0, v1, v2, v3);
	    };
	  }

	  function constant(x) {
	    return function() {
	      return x;
	    };
	  }

	  function linear(a, d) {
	    return function(t) {
	      return a + t * d;
	    };
	  }

	  function exponential(a, b, y) {
	    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
	      return Math.pow(a + t * b, y);
	    };
	  }

	  function hue(a, b) {
	    var d = b - a;
	    return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
	  }

	  function gamma(y) {
	    return (y = +y) === 1 ? nogamma : function(a, b) {
	      return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
	    };
	  }

	  function nogamma(a, b) {
	    var d = b - a;
	    return d ? linear(a, d) : constant(isNaN(a) ? b : a);
	  }

	  var rgb$1 = (function rgbGamma(y) {
	    var color = gamma(y);

	    function rgb(start, end) {
	      var r = color((start = d3Color.rgb(start)).r, (end = d3Color.rgb(end)).r),
	          g = color(start.g, end.g),
	          b = color(start.b, end.b),
	          opacity = color(start.opacity, end.opacity);
	      return function(t) {
	        start.r = r(t);
	        start.g = g(t);
	        start.b = b(t);
	        start.opacity = opacity(t);
	        return start + "";
	      };
	    }

	    rgb.gamma = rgbGamma;

	    return rgb;
	  })(1);

	  function rgbSpline(spline) {
	    return function(colors) {
	      var n = colors.length,
	          r = new Array(n),
	          g = new Array(n),
	          b = new Array(n),
	          i, color;
	      for (i = 0; i < n; ++i) {
	        color = d3Color.rgb(colors[i]);
	        r[i] = color.r || 0;
	        g[i] = color.g || 0;
	        b[i] = color.b || 0;
	      }
	      r = spline(r);
	      g = spline(g);
	      b = spline(b);
	      color.opacity = 1;
	      return function(t) {
	        color.r = r(t);
	        color.g = g(t);
	        color.b = b(t);
	        return color + "";
	      };
	    };
	  }

	  var rgbBasis = rgbSpline(basis$1);
	  var rgbBasisClosed = rgbSpline(basisClosed);

	  function array(a, b) {
	    var nb = b ? b.length : 0,
	        na = a ? Math.min(nb, a.length) : 0,
	        x = new Array(nb),
	        c = new Array(nb),
	        i;

	    for (i = 0; i < na; ++i) x[i] = value(a[i], b[i]);
	    for (; i < nb; ++i) c[i] = b[i];

	    return function(t) {
	      for (i = 0; i < na; ++i) c[i] = x[i](t);
	      return c;
	    };
	  }

	  function date(a, b) {
	    var d = new Date;
	    return a = +a, b -= a, function(t) {
	      return d.setTime(a + b * t), d;
	    };
	  }

	  function number(a, b) {
	    return a = +a, b -= a, function(t) {
	      return a + b * t;
	    };
	  }

	  function object(a, b) {
	    var i = {},
	        c = {},
	        k;

	    if (a === null || typeof a !== "object") a = {};
	    if (b === null || typeof b !== "object") b = {};

	    for (k in b) {
	      if (k in a) {
	        i[k] = value(a[k], b[k]);
	      } else {
	        c[k] = b[k];
	      }
	    }

	    return function(t) {
	      for (k in i) c[k] = i[k](t);
	      return c;
	    };
	  }

	  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
	  var reB = new RegExp(reA.source, "g");
	  function zero(b) {
	    return function() {
	      return b;
	    };
	  }

	  function one(b) {
	    return function(t) {
	      return b(t) + "";
	    };
	  }

	  function string(a, b) {
	    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
	        am, // current match in a
	        bm, // current match in b
	        bs, // string preceding current number in b, if any
	        i = -1, // index in s
	        s = [], // string constants and placeholders
	        q = []; // number interpolators

	    // Coerce inputs to strings.
	    a = a + "", b = b + "";

	    // Interpolate pairs of numbers in a & b.
	    while ((am = reA.exec(a))
	        && (bm = reB.exec(b))) {
	      if ((bs = bm.index) > bi) { // a string precedes the next number in b
	        bs = b.slice(bi, bs);
	        if (s[i]) s[i] += bs; // coalesce with previous string
	        else s[++i] = bs;
	      }
	      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
	        if (s[i]) s[i] += bm; // coalesce with previous string
	        else s[++i] = bm;
	      } else { // interpolate non-matching numbers
	        s[++i] = null;
	        q.push({i: i, x: number(am, bm)});
	      }
	      bi = reB.lastIndex;
	    }

	    // Add remains of b.
	    if (bi < b.length) {
	      bs = b.slice(bi);
	      if (s[i]) s[i] += bs; // coalesce with previous string
	      else s[++i] = bs;
	    }

	    // Special optimization for only a single match.
	    // Otherwise, interpolate each of the numbers and rejoin the string.
	    return s.length < 2 ? (q[0]
	        ? one(q[0].x)
	        : zero(b))
	        : (b = q.length, function(t) {
	            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
	            return s.join("");
	          });
	  }

	  function value(a, b) {
	    var t = typeof b, c;
	    return b == null || t === "boolean" ? constant(b)
	        : (t === "number" ? number
	        : t === "string" ? ((c = d3Color.color(b)) ? (b = c, rgb$1) : string)
	        : b instanceof d3Color.color ? rgb$1
	        : b instanceof Date ? date
	        : Array.isArray(b) ? array
	        : isNaN(b) ? object
	        : number)(a, b);
	  }

	  function round(a, b) {
	    return a = +a, b -= a, function(t) {
	      return Math.round(a + b * t);
	    };
	  }

	  var degrees = 180 / Math.PI;

	  var identity = {
	    translateX: 0,
	    translateY: 0,
	    rotate: 0,
	    skewX: 0,
	    scaleX: 1,
	    scaleY: 1
	  };

	  function decompose(a, b, c, d, e, f) {
	    var scaleX, scaleY, skewX;
	    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
	    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
	    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
	    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
	    return {
	      translateX: e,
	      translateY: f,
	      rotate: Math.atan2(b, a) * degrees,
	      skewX: Math.atan(skewX) * degrees,
	      scaleX: scaleX,
	      scaleY: scaleY
	    };
	  }

	  var cssNode;
	  var cssRoot;
	  var cssView;
	  var svgNode;
	  function parseCss(value) {
	    if (value === "none") return identity;
	    if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
	    cssNode.style.transform = value;
	    value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
	    cssRoot.removeChild(cssNode);
	    value = value.slice(7, -1).split(",");
	    return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
	  }

	  function parseSvg(value) {
	    if (value == null) return identity;
	    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
	    svgNode.setAttribute("transform", value);
	    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
	    value = value.matrix;
	    return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
	  }

	  function interpolateTransform(parse, pxComma, pxParen, degParen) {

	    function pop(s) {
	      return s.length ? s.pop() + " " : "";
	    }

	    function translate(xa, ya, xb, yb, s, q) {
	      if (xa !== xb || ya !== yb) {
	        var i = s.push("translate(", null, pxComma, null, pxParen);
	        q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
	      } else if (xb || yb) {
	        s.push("translate(" + xb + pxComma + yb + pxParen);
	      }
	    }

	    function rotate(a, b, s, q) {
	      if (a !== b) {
	        if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
	        q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number(a, b)});
	      } else if (b) {
	        s.push(pop(s) + "rotate(" + b + degParen);
	      }
	    }

	    function skewX(a, b, s, q) {
	      if (a !== b) {
	        q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number(a, b)});
	      } else if (b) {
	        s.push(pop(s) + "skewX(" + b + degParen);
	      }
	    }

	    function scale(xa, ya, xb, yb, s, q) {
	      if (xa !== xb || ya !== yb) {
	        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
	        q.push({i: i - 4, x: number(xa, xb)}, {i: i - 2, x: number(ya, yb)});
	      } else if (xb !== 1 || yb !== 1) {
	        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
	      }
	    }

	    return function(a, b) {
	      var s = [], // string constants and placeholders
	          q = []; // number interpolators
	      a = parse(a), b = parse(b);
	      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
	      rotate(a.rotate, b.rotate, s, q);
	      skewX(a.skewX, b.skewX, s, q);
	      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
	      a = b = null; // gc
	      return function(t) {
	        var i = -1, n = q.length, o;
	        while (++i < n) s[(o = q[i]).i] = o.x(t);
	        return s.join("");
	      };
	    };
	  }

	  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
	  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

	  var rho = Math.SQRT2;
	  var rho2 = 2;
	  var rho4 = 4;
	  var epsilon2 = 1e-12;
	  function cosh(x) {
	    return ((x = Math.exp(x)) + 1 / x) / 2;
	  }

	  function sinh(x) {
	    return ((x = Math.exp(x)) - 1 / x) / 2;
	  }

	  function tanh(x) {
	    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
	  }

	  // p0 = [ux0, uy0, w0]
	  // p1 = [ux1, uy1, w1]
	  function zoom(p0, p1) {
	    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
	        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
	        dx = ux1 - ux0,
	        dy = uy1 - uy0,
	        d2 = dx * dx + dy * dy,
	        i,
	        S;

	    // Special case for u0 ≅ u1.
	    if (d2 < epsilon2) {
	      S = Math.log(w1 / w0) / rho;
	      i = function(t) {
	        return [
	          ux0 + t * dx,
	          uy0 + t * dy,
	          w0 * Math.exp(rho * t * S)
	        ];
	      }
	    }

	    // General case.
	    else {
	      var d1 = Math.sqrt(d2),
	          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
	          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
	          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
	          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
	      S = (r1 - r0) / rho;
	      i = function(t) {
	        var s = t * S,
	            coshr0 = cosh(r0),
	            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
	        return [
	          ux0 + u * dx,
	          uy0 + u * dy,
	          w0 * coshr0 / cosh(rho * s + r0)
	        ];
	      }
	    }

	    i.duration = S * 1000;

	    return i;
	  }

	  function hsl$1(hue) {
	    return function(start, end) {
	      var h = hue((start = d3Color.hsl(start)).h, (end = d3Color.hsl(end)).h),
	          s = nogamma(start.s, end.s),
	          l = nogamma(start.l, end.l),
	          opacity = nogamma(start.opacity, end.opacity);
	      return function(t) {
	        start.h = h(t);
	        start.s = s(t);
	        start.l = l(t);
	        start.opacity = opacity(t);
	        return start + "";
	      };
	    }
	  }

	  var hsl$2 = hsl$1(hue);
	  var hslLong = hsl$1(nogamma);

	  function lab$1(start, end) {
	    var l = nogamma((start = d3Color.lab(start)).l, (end = d3Color.lab(end)).l),
	        a = nogamma(start.a, end.a),
	        b = nogamma(start.b, end.b),
	        opacity = nogamma(start.opacity, end.opacity);
	    return function(t) {
	      start.l = l(t);
	      start.a = a(t);
	      start.b = b(t);
	      start.opacity = opacity(t);
	      return start + "";
	    };
	  }

	  function hcl$1(hue) {
	    return function(start, end) {
	      var h = hue((start = d3Color.hcl(start)).h, (end = d3Color.hcl(end)).h),
	          c = nogamma(start.c, end.c),
	          l = nogamma(start.l, end.l),
	          opacity = nogamma(start.opacity, end.opacity);
	      return function(t) {
	        start.h = h(t);
	        start.c = c(t);
	        start.l = l(t);
	        start.opacity = opacity(t);
	        return start + "";
	      };
	    }
	  }

	  var hcl$2 = hcl$1(hue);
	  var hclLong = hcl$1(nogamma);

	  function cubehelix$1(hue) {
	    return (function cubehelixGamma(y) {
	      y = +y;

	      function cubehelix(start, end) {
	        var h = hue((start = d3Color.cubehelix(start)).h, (end = d3Color.cubehelix(end)).h),
	            s = nogamma(start.s, end.s),
	            l = nogamma(start.l, end.l),
	            opacity = nogamma(start.opacity, end.opacity);
	        return function(t) {
	          start.h = h(t);
	          start.s = s(t);
	          start.l = l(Math.pow(t, y));
	          start.opacity = opacity(t);
	          return start + "";
	        };
	      }

	      cubehelix.gamma = cubehelixGamma;

	      return cubehelix;
	    })(1);
	  }

	  var cubehelix$2 = cubehelix$1(hue);
	  var cubehelixLong = cubehelix$1(nogamma);

	  function quantize(interpolator, n) {
	    var samples = new Array(n);
	    for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
	    return samples;
	  }

	  exports.interpolate = value;
	  exports.interpolateArray = array;
	  exports.interpolateBasis = basis$1;
	  exports.interpolateBasisClosed = basisClosed;
	  exports.interpolateDate = date;
	  exports.interpolateNumber = number;
	  exports.interpolateObject = object;
	  exports.interpolateRound = round;
	  exports.interpolateString = string;
	  exports.interpolateTransformCss = interpolateTransformCss;
	  exports.interpolateTransformSvg = interpolateTransformSvg;
	  exports.interpolateZoom = zoom;
	  exports.interpolateRgb = rgb$1;
	  exports.interpolateRgbBasis = rgbBasis;
	  exports.interpolateRgbBasisClosed = rgbBasisClosed;
	  exports.interpolateHsl = hsl$2;
	  exports.interpolateHslLong = hslLong;
	  exports.interpolateLab = lab$1;
	  exports.interpolateHcl = hcl$2;
	  exports.interpolateHclLong = hclLong;
	  exports.interpolateCubehelix = cubehelix$2;
	  exports.interpolateCubehelixLong = cubehelixLong;
	  exports.quantize = quantize;

	  Object.defineProperty(exports, '__esModule', { value: true });

	}));

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-color/ Version 1.0.0. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.d3 = global.d3 || {})));
	}(this, function (exports) { 'use strict';

	  function define(constructor, factory, prototype) {
	    constructor.prototype = factory.prototype = prototype;
	    prototype.constructor = constructor;
	  }

	  function extend(parent, definition) {
	    var prototype = Object.create(parent.prototype);
	    for (var key in definition) prototype[key] = definition[key];
	    return prototype;
	  }

	  function Color() {}

	  var darker = 0.7;
	  var brighter = 1 / darker;

	  var reHex3 = /^#([0-9a-f]{3})$/;
	  var reHex6 = /^#([0-9a-f]{6})$/;
	  var reRgbInteger = /^rgb\(\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*\)$/;
	  var reRgbPercent = /^rgb\(\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*\)$/;
	  var reRgbaInteger = /^rgba\(\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+)\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/;
	  var reRgbaPercent = /^rgba\(\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/;
	  var reHslPercent = /^hsl\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*\)$/;
	  var reHslaPercent = /^hsla\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)%\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)$/;
	  var named = {
	    aliceblue: 0xf0f8ff,
	    antiquewhite: 0xfaebd7,
	    aqua: 0x00ffff,
	    aquamarine: 0x7fffd4,
	    azure: 0xf0ffff,
	    beige: 0xf5f5dc,
	    bisque: 0xffe4c4,
	    black: 0x000000,
	    blanchedalmond: 0xffebcd,
	    blue: 0x0000ff,
	    blueviolet: 0x8a2be2,
	    brown: 0xa52a2a,
	    burlywood: 0xdeb887,
	    cadetblue: 0x5f9ea0,
	    chartreuse: 0x7fff00,
	    chocolate: 0xd2691e,
	    coral: 0xff7f50,
	    cornflowerblue: 0x6495ed,
	    cornsilk: 0xfff8dc,
	    crimson: 0xdc143c,
	    cyan: 0x00ffff,
	    darkblue: 0x00008b,
	    darkcyan: 0x008b8b,
	    darkgoldenrod: 0xb8860b,
	    darkgray: 0xa9a9a9,
	    darkgreen: 0x006400,
	    darkgrey: 0xa9a9a9,
	    darkkhaki: 0xbdb76b,
	    darkmagenta: 0x8b008b,
	    darkolivegreen: 0x556b2f,
	    darkorange: 0xff8c00,
	    darkorchid: 0x9932cc,
	    darkred: 0x8b0000,
	    darksalmon: 0xe9967a,
	    darkseagreen: 0x8fbc8f,
	    darkslateblue: 0x483d8b,
	    darkslategray: 0x2f4f4f,
	    darkslategrey: 0x2f4f4f,
	    darkturquoise: 0x00ced1,
	    darkviolet: 0x9400d3,
	    deeppink: 0xff1493,
	    deepskyblue: 0x00bfff,
	    dimgray: 0x696969,
	    dimgrey: 0x696969,
	    dodgerblue: 0x1e90ff,
	    firebrick: 0xb22222,
	    floralwhite: 0xfffaf0,
	    forestgreen: 0x228b22,
	    fuchsia: 0xff00ff,
	    gainsboro: 0xdcdcdc,
	    ghostwhite: 0xf8f8ff,
	    gold: 0xffd700,
	    goldenrod: 0xdaa520,
	    gray: 0x808080,
	    green: 0x008000,
	    greenyellow: 0xadff2f,
	    grey: 0x808080,
	    honeydew: 0xf0fff0,
	    hotpink: 0xff69b4,
	    indianred: 0xcd5c5c,
	    indigo: 0x4b0082,
	    ivory: 0xfffff0,
	    khaki: 0xf0e68c,
	    lavender: 0xe6e6fa,
	    lavenderblush: 0xfff0f5,
	    lawngreen: 0x7cfc00,
	    lemonchiffon: 0xfffacd,
	    lightblue: 0xadd8e6,
	    lightcoral: 0xf08080,
	    lightcyan: 0xe0ffff,
	    lightgoldenrodyellow: 0xfafad2,
	    lightgray: 0xd3d3d3,
	    lightgreen: 0x90ee90,
	    lightgrey: 0xd3d3d3,
	    lightpink: 0xffb6c1,
	    lightsalmon: 0xffa07a,
	    lightseagreen: 0x20b2aa,
	    lightskyblue: 0x87cefa,
	    lightslategray: 0x778899,
	    lightslategrey: 0x778899,
	    lightsteelblue: 0xb0c4de,
	    lightyellow: 0xffffe0,
	    lime: 0x00ff00,
	    limegreen: 0x32cd32,
	    linen: 0xfaf0e6,
	    magenta: 0xff00ff,
	    maroon: 0x800000,
	    mediumaquamarine: 0x66cdaa,
	    mediumblue: 0x0000cd,
	    mediumorchid: 0xba55d3,
	    mediumpurple: 0x9370db,
	    mediumseagreen: 0x3cb371,
	    mediumslateblue: 0x7b68ee,
	    mediumspringgreen: 0x00fa9a,
	    mediumturquoise: 0x48d1cc,
	    mediumvioletred: 0xc71585,
	    midnightblue: 0x191970,
	    mintcream: 0xf5fffa,
	    mistyrose: 0xffe4e1,
	    moccasin: 0xffe4b5,
	    navajowhite: 0xffdead,
	    navy: 0x000080,
	    oldlace: 0xfdf5e6,
	    olive: 0x808000,
	    olivedrab: 0x6b8e23,
	    orange: 0xffa500,
	    orangered: 0xff4500,
	    orchid: 0xda70d6,
	    palegoldenrod: 0xeee8aa,
	    palegreen: 0x98fb98,
	    paleturquoise: 0xafeeee,
	    palevioletred: 0xdb7093,
	    papayawhip: 0xffefd5,
	    peachpuff: 0xffdab9,
	    peru: 0xcd853f,
	    pink: 0xffc0cb,
	    plum: 0xdda0dd,
	    powderblue: 0xb0e0e6,
	    purple: 0x800080,
	    rebeccapurple: 0x663399,
	    red: 0xff0000,
	    rosybrown: 0xbc8f8f,
	    royalblue: 0x4169e1,
	    saddlebrown: 0x8b4513,
	    salmon: 0xfa8072,
	    sandybrown: 0xf4a460,
	    seagreen: 0x2e8b57,
	    seashell: 0xfff5ee,
	    sienna: 0xa0522d,
	    silver: 0xc0c0c0,
	    skyblue: 0x87ceeb,
	    slateblue: 0x6a5acd,
	    slategray: 0x708090,
	    slategrey: 0x708090,
	    snow: 0xfffafa,
	    springgreen: 0x00ff7f,
	    steelblue: 0x4682b4,
	    tan: 0xd2b48c,
	    teal: 0x008080,
	    thistle: 0xd8bfd8,
	    tomato: 0xff6347,
	    turquoise: 0x40e0d0,
	    violet: 0xee82ee,
	    wheat: 0xf5deb3,
	    white: 0xffffff,
	    whitesmoke: 0xf5f5f5,
	    yellow: 0xffff00,
	    yellowgreen: 0x9acd32
	  };

	  define(Color, color, {
	    displayable: function() {
	      return this.rgb().displayable();
	    },
	    toString: function() {
	      return this.rgb() + "";
	    }
	  });

	  function color(format) {
	    var m;
	    format = (format + "").trim().toLowerCase();
	    return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
	        : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
	        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
	        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
	        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
	        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
	        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
	        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
	        : named.hasOwnProperty(format) ? rgbn(named[format])
	        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
	        : null;
	  }

	  function rgbn(n) {
	    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
	  }

	  function rgba(r, g, b, a) {
	    if (a <= 0) r = g = b = NaN;
	    return new Rgb(r, g, b, a);
	  }

	  function rgbConvert(o) {
	    if (!(o instanceof Color)) o = color(o);
	    if (!o) return new Rgb;
	    o = o.rgb();
	    return new Rgb(o.r, o.g, o.b, o.opacity);
	  }

	  function rgb(r, g, b, opacity) {
	    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
	  }

	  function Rgb(r, g, b, opacity) {
	    this.r = +r;
	    this.g = +g;
	    this.b = +b;
	    this.opacity = +opacity;
	  }

	  define(Rgb, rgb, extend(Color, {
	    brighter: function(k) {
	      k = k == null ? brighter : Math.pow(brighter, k);
	      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	    },
	    darker: function(k) {
	      k = k == null ? darker : Math.pow(darker, k);
	      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	    },
	    rgb: function() {
	      return this;
	    },
	    displayable: function() {
	      return (0 <= this.r && this.r <= 255)
	          && (0 <= this.g && this.g <= 255)
	          && (0 <= this.b && this.b <= 255)
	          && (0 <= this.opacity && this.opacity <= 1);
	    },
	    toString: function() {
	      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
	      return (a === 1 ? "rgb(" : "rgba(")
	          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
	          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
	          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
	          + (a === 1 ? ")" : ", " + a + ")");
	    }
	  }));

	  function hsla(h, s, l, a) {
	    if (a <= 0) h = s = l = NaN;
	    else if (l <= 0 || l >= 1) h = s = NaN;
	    else if (s <= 0) h = NaN;
	    return new Hsl(h, s, l, a);
	  }

	  function hslConvert(o) {
	    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	    if (!(o instanceof Color)) o = color(o);
	    if (!o) return new Hsl;
	    if (o instanceof Hsl) return o;
	    o = o.rgb();
	    var r = o.r / 255,
	        g = o.g / 255,
	        b = o.b / 255,
	        min = Math.min(r, g, b),
	        max = Math.max(r, g, b),
	        h = NaN,
	        s = max - min,
	        l = (max + min) / 2;
	    if (s) {
	      if (r === max) h = (g - b) / s + (g < b) * 6;
	      else if (g === max) h = (b - r) / s + 2;
	      else h = (r - g) / s + 4;
	      s /= l < 0.5 ? max + min : 2 - max - min;
	      h *= 60;
	    } else {
	      s = l > 0 && l < 1 ? 0 : h;
	    }
	    return new Hsl(h, s, l, o.opacity);
	  }

	  function hsl(h, s, l, opacity) {
	    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
	  }

	  function Hsl(h, s, l, opacity) {
	    this.h = +h;
	    this.s = +s;
	    this.l = +l;
	    this.opacity = +opacity;
	  }

	  define(Hsl, hsl, extend(Color, {
	    brighter: function(k) {
	      k = k == null ? brighter : Math.pow(brighter, k);
	      return new Hsl(this.h, this.s, this.l * k, this.opacity);
	    },
	    darker: function(k) {
	      k = k == null ? darker : Math.pow(darker, k);
	      return new Hsl(this.h, this.s, this.l * k, this.opacity);
	    },
	    rgb: function() {
	      var h = this.h % 360 + (this.h < 0) * 360,
	          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
	          l = this.l,
	          m2 = l + (l < 0.5 ? l : 1 - l) * s,
	          m1 = 2 * l - m2;
	      return new Rgb(
	        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
	        hsl2rgb(h, m1, m2),
	        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
	        this.opacity
	      );
	    },
	    displayable: function() {
	      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
	          && (0 <= this.l && this.l <= 1)
	          && (0 <= this.opacity && this.opacity <= 1);
	    }
	  }));

	  /* From FvD 13.37, CSS Color Module Level 3 */
	  function hsl2rgb(h, m1, m2) {
	    return (h < 60 ? m1 + (m2 - m1) * h / 60
	        : h < 180 ? m2
	        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
	        : m1) * 255;
	  }

	  var deg2rad = Math.PI / 180;
	  var rad2deg = 180 / Math.PI;

	  var Kn = 18;
	  var Xn = 0.950470;
	  var Yn = 1;
	  var Zn = 1.088830;
	  var t0 = 4 / 29;
	  var t1 = 6 / 29;
	  var t2 = 3 * t1 * t1;
	  var t3 = t1 * t1 * t1;
	  function labConvert(o) {
	    if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
	    if (o instanceof Hcl) {
	      var h = o.h * deg2rad;
	      return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
	    }
	    if (!(o instanceof Rgb)) o = rgbConvert(o);
	    var b = rgb2xyz(o.r),
	        a = rgb2xyz(o.g),
	        l = rgb2xyz(o.b),
	        x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
	        y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
	        z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);
	    return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
	  }

	  function lab(l, a, b, opacity) {
	    return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
	  }

	  function Lab(l, a, b, opacity) {
	    this.l = +l;
	    this.a = +a;
	    this.b = +b;
	    this.opacity = +opacity;
	  }

	  define(Lab, lab, extend(Color, {
	    brighter: function(k) {
	      return new Lab(this.l + Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
	    },
	    darker: function(k) {
	      return new Lab(this.l - Kn * (k == null ? 1 : k), this.a, this.b, this.opacity);
	    },
	    rgb: function() {
	      var y = (this.l + 16) / 116,
	          x = isNaN(this.a) ? y : y + this.a / 500,
	          z = isNaN(this.b) ? y : y - this.b / 200;
	      y = Yn * lab2xyz(y);
	      x = Xn * lab2xyz(x);
	      z = Zn * lab2xyz(z);
	      return new Rgb(
	        xyz2rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
	        xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
	        xyz2rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
	        this.opacity
	      );
	    }
	  }));

	  function xyz2lab(t) {
	    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
	  }

	  function lab2xyz(t) {
	    return t > t1 ? t * t * t : t2 * (t - t0);
	  }

	  function xyz2rgb(x) {
	    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
	  }

	  function rgb2xyz(x) {
	    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
	  }

	  function hclConvert(o) {
	    if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
	    if (!(o instanceof Lab)) o = labConvert(o);
	    var h = Math.atan2(o.b, o.a) * rad2deg;
	    return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
	  }

	  function hcl(h, c, l, opacity) {
	    return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
	  }

	  function Hcl(h, c, l, opacity) {
	    this.h = +h;
	    this.c = +c;
	    this.l = +l;
	    this.opacity = +opacity;
	  }

	  define(Hcl, hcl, extend(Color, {
	    brighter: function(k) {
	      return new Hcl(this.h, this.c, this.l + Kn * (k == null ? 1 : k), this.opacity);
	    },
	    darker: function(k) {
	      return new Hcl(this.h, this.c, this.l - Kn * (k == null ? 1 : k), this.opacity);
	    },
	    rgb: function() {
	      return labConvert(this).rgb();
	    }
	  }));

	  var A = -0.14861;
	  var B = +1.78277;
	  var C = -0.29227;
	  var D = -0.90649;
	  var E = +1.97294;
	  var ED = E * D;
	  var EB = E * B;
	  var BC_DA = B * C - D * A;
	  function cubehelixConvert(o) {
	    if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
	    if (!(o instanceof Rgb)) o = rgbConvert(o);
	    var r = o.r / 255,
	        g = o.g / 255,
	        b = o.b / 255,
	        l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
	        bl = b - l,
	        k = (E * (g - l) - C * bl) / D,
	        s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
	        h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
	    return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
	  }

	  function cubehelix(h, s, l, opacity) {
	    return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
	  }

	  function Cubehelix(h, s, l, opacity) {
	    this.h = +h;
	    this.s = +s;
	    this.l = +l;
	    this.opacity = +opacity;
	  }

	  define(Cubehelix, cubehelix, extend(Color, {
	    brighter: function(k) {
	      k = k == null ? brighter : Math.pow(brighter, k);
	      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	    },
	    darker: function(k) {
	      k = k == null ? darker : Math.pow(darker, k);
	      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
	    },
	    rgb: function() {
	      var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
	          l = +this.l,
	          a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
	          cosh = Math.cos(h),
	          sinh = Math.sin(h);
	      return new Rgb(
	        255 * (l + a * (A * cosh + B * sinh)),
	        255 * (l + a * (C * cosh + D * sinh)),
	        255 * (l + a * (E * cosh)),
	        this.opacity
	      );
	    }
	  }));

	  exports.color = color;
	  exports.rgb = rgb;
	  exports.hsl = hsl;
	  exports.lab = lab;
	  exports.hcl = hcl;
	  exports.cubehelix = cubehelix;

	  Object.defineProperty(exports, '__esModule', { value: true });

	}));

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// https://d3js.org/d3-ease/ Version 1.0.0. Copyright 2016 Mike Bostock.
	(function (global, factory) {
	   true ? factory(exports) :
	  typeof define === 'function' && define.amd ? define(['exports'], factory) :
	  (factory((global.d3 = global.d3 || {})));
	}(this, function (exports) { 'use strict';

	  function linear(t) {
	    return +t;
	  }

	  function quadIn(t) {
	    return t * t;
	  }

	  function quadOut(t) {
	    return t * (2 - t);
	  }

	  function quadInOut(t) {
	    return ((t *= 2) <= 1 ? t * t : --t * (2 - t) + 1) / 2;
	  }

	  function cubicIn(t) {
	    return t * t * t;
	  }

	  function cubicOut(t) {
	    return --t * t * t + 1;
	  }

	  function cubicInOut(t) {
	    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
	  }

	  var exponent = 3;

	  var polyIn = (function custom(e) {
	    e = +e;

	    function polyIn(t) {
	      return Math.pow(t, e);
	    }

	    polyIn.exponent = custom;

	    return polyIn;
	  })(exponent);

	  var polyOut = (function custom(e) {
	    e = +e;

	    function polyOut(t) {
	      return 1 - Math.pow(1 - t, e);
	    }

	    polyOut.exponent = custom;

	    return polyOut;
	  })(exponent);

	  var polyInOut = (function custom(e) {
	    e = +e;

	    function polyInOut(t) {
	      return ((t *= 2) <= 1 ? Math.pow(t, e) : 2 - Math.pow(2 - t, e)) / 2;
	    }

	    polyInOut.exponent = custom;

	    return polyInOut;
	  })(exponent);

	  var pi = Math.PI;
	  var halfPi = pi / 2;
	  function sinIn(t) {
	    return 1 - Math.cos(t * halfPi);
	  }

	  function sinOut(t) {
	    return Math.sin(t * halfPi);
	  }

	  function sinInOut(t) {
	    return (1 - Math.cos(pi * t)) / 2;
	  }

	  function expIn(t) {
	    return Math.pow(2, 10 * t - 10);
	  }

	  function expOut(t) {
	    return 1 - Math.pow(2, -10 * t);
	  }

	  function expInOut(t) {
	    return ((t *= 2) <= 1 ? Math.pow(2, 10 * t - 10) : 2 - Math.pow(2, 10 - 10 * t)) / 2;
	  }

	  function circleIn(t) {
	    return 1 - Math.sqrt(1 - t * t);
	  }

	  function circleOut(t) {
	    return Math.sqrt(1 - --t * t);
	  }

	  function circleInOut(t) {
	    return ((t *= 2) <= 1 ? 1 - Math.sqrt(1 - t * t) : Math.sqrt(1 - (t -= 2) * t) + 1) / 2;
	  }

	  var b1 = 4 / 11;
	  var b2 = 6 / 11;
	  var b3 = 8 / 11;
	  var b4 = 3 / 4;
	  var b5 = 9 / 11;
	  var b6 = 10 / 11;
	  var b7 = 15 / 16;
	  var b8 = 21 / 22;
	  var b9 = 63 / 64;
	  var b0 = 1 / b1 / b1;
	  function bounceIn(t) {
	    return 1 - bounceOut(1 - t);
	  }

	  function bounceOut(t) {
	    return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
	  }

	  function bounceInOut(t) {
	    return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
	  }

	  var overshoot = 1.70158;

	  var backIn = (function custom(s) {
	    s = +s;

	    function backIn(t) {
	      return t * t * ((s + 1) * t - s);
	    }

	    backIn.overshoot = custom;

	    return backIn;
	  })(overshoot);

	  var backOut = (function custom(s) {
	    s = +s;

	    function backOut(t) {
	      return --t * t * ((s + 1) * t + s) + 1;
	    }

	    backOut.overshoot = custom;

	    return backOut;
	  })(overshoot);

	  var backInOut = (function custom(s) {
	    s = +s;

	    function backInOut(t) {
	      return ((t *= 2) < 1 ? t * t * ((s + 1) * t - s) : (t -= 2) * t * ((s + 1) * t + s) + 2) / 2;
	    }

	    backInOut.overshoot = custom;

	    return backInOut;
	  })(overshoot);

	  var tau = 2 * Math.PI;
	  var amplitude = 1;
	  var period = 0.3;
	  var elasticIn = (function custom(a, p) {
	    var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	    function elasticIn(t) {
	      return a * Math.pow(2, 10 * --t) * Math.sin((s - t) / p);
	    }

	    elasticIn.amplitude = function(a) { return custom(a, p * tau); };
	    elasticIn.period = function(p) { return custom(a, p); };

	    return elasticIn;
	  })(amplitude, period);

	  var elasticOut = (function custom(a, p) {
	    var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	    function elasticOut(t) {
	      return 1 - a * Math.pow(2, -10 * (t = +t)) * Math.sin((t + s) / p);
	    }

	    elasticOut.amplitude = function(a) { return custom(a, p * tau); };
	    elasticOut.period = function(p) { return custom(a, p); };

	    return elasticOut;
	  })(amplitude, period);

	  var elasticInOut = (function custom(a, p) {
	    var s = Math.asin(1 / (a = Math.max(1, a))) * (p /= tau);

	    function elasticInOut(t) {
	      return ((t = t * 2 - 1) < 0
	          ? a * Math.pow(2, 10 * t) * Math.sin((s - t) / p)
	          : 2 - a * Math.pow(2, -10 * t) * Math.sin((s + t) / p)) / 2;
	    }

	    elasticInOut.amplitude = function(a) { return custom(a, p * tau); };
	    elasticInOut.period = function(p) { return custom(a, p); };

	    return elasticInOut;
	  })(amplitude, period);

	  exports.easeLinear = linear;
	  exports.easeQuad = quadInOut;
	  exports.easeQuadIn = quadIn;
	  exports.easeQuadOut = quadOut;
	  exports.easeQuadInOut = quadInOut;
	  exports.easeCubic = cubicInOut;
	  exports.easeCubicIn = cubicIn;
	  exports.easeCubicOut = cubicOut;
	  exports.easeCubicInOut = cubicInOut;
	  exports.easePoly = polyInOut;
	  exports.easePolyIn = polyIn;
	  exports.easePolyOut = polyOut;
	  exports.easePolyInOut = polyInOut;
	  exports.easeSin = sinInOut;
	  exports.easeSinIn = sinIn;
	  exports.easeSinOut = sinOut;
	  exports.easeSinInOut = sinInOut;
	  exports.easeExp = expInOut;
	  exports.easeExpIn = expIn;
	  exports.easeExpOut = expOut;
	  exports.easeExpInOut = expInOut;
	  exports.easeCircle = circleInOut;
	  exports.easeCircleIn = circleIn;
	  exports.easeCircleOut = circleOut;
	  exports.easeCircleInOut = circleInOut;
	  exports.easeBounce = bounceOut;
	  exports.easeBounceIn = bounceIn;
	  exports.easeBounceOut = bounceOut;
	  exports.easeBounceInOut = bounceInOut;
	  exports.easeBack = backInOut;
	  exports.easeBackIn = backIn;
	  exports.easeBackOut = backOut;
	  exports.easeBackInOut = backInOut;
	  exports.easeElastic = elasticOut;
	  exports.easeElasticIn = elasticIn;
	  exports.easeElasticOut = elasticOut;
	  exports.easeElasticInOut = elasticInOut;

	  Object.defineProperty(exports, '__esModule', { value: true });

	}));

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Colorizer = function () {
		/**
	  * @return {void}
	  */

		function Colorizer() {
			_classCallCheck(this, Colorizer);

			this.hexExpression = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
			this.instanceId = null;
			this.labelFill = null;
			this.scale = null;
		}

		/**
	  * @param {string} instanceId
	  *
	  * @return {void}
	  */


		_createClass(Colorizer, [{
			key: 'setInstanceId',
			value: function setInstanceId(instanceId) {
				this.instanceId = instanceId;
			}

			/**
	   * @param {string} fill
	   *
	   * @return {void}
	   */

		}, {
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
	   * @param {string} instanceId
	   *
	   * @return {Object}
	   */

		}, {
			key: 'getBlockFill',
			value: function getBlockFill(block, index, type, instanceId) {
				var raw = this.getBlockRawFill(block, index);

				return {
					raw: raw,
					actual: this.getBlockActualFill(raw, index, type, instanceId)
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

				return 'url(#' + this.getGradientId(index) + ')';
			}

			/**
	   * Return the gradient ID for the given index.
	   *
	   * @param {Number} index
	   *
	   * @return {string}
	   */

		}, {
			key: 'getGradientId',
			value: function getGradientId(index) {
				return this.instanceId + '-gradient-' + index;
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
	}();

	exports.default = Colorizer;

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var LabelFormatter = function () {
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
	}();

	exports.default = LabelFormatter;

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Navigator = function () {
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
	   * @return {string}
	   */
			value: function plot(commands) {
				var path = '';

				commands.forEach(function (command) {
					path += '' + command[0] + command[1] + ',' + command[2] + ' ';
				});

				return path.replace(/ +/g, ' ').trim();
			}

			/**
	   * @param {Object}  dimensions
	   * @param {boolean} isValueOverlay
	   *
	   * @return {Array}
	   */

		}, {
			key: 'makeCurvedPaths',
			value: function makeCurvedPaths(dimensions) {
				var isValueOverlay = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

				var points = this.makeBezierPoints(dimensions);

				if (isValueOverlay) {
					return this.makeBezierPath(points, dimensions.ratio);
				}

				return this.makeBezierPath(points);
			}

			/**
	   * @param {Number} centerX
	   * @param {Number} prevLeftX
	   * @param {Number} prevRightX
	   * @param {Number} prevHeight
	   * @param {Number} nextLeftX
	   * @param {Number} nextRightX
	   * @param {Number} nextHeight
	   * @param {Number} curveHeight
	   *
	   * @return {Object}
	   */

		}, {
			key: 'makeBezierPoints',
			value: function makeBezierPoints(_ref) {
				var centerX = _ref.centerX;
				var prevLeftX = _ref.prevLeftX;
				var prevRightX = _ref.prevRightX;
				var prevHeight = _ref.prevHeight;
				var nextLeftX = _ref.nextLeftX;
				var nextRightX = _ref.nextRightX;
				var nextHeight = _ref.nextHeight;
				var curveHeight = _ref.curveHeight;

				return {
					p00: {
						x: prevLeftX,
						y: prevHeight
					},
					p01: {
						x: centerX,
						y: prevHeight + (curveHeight - 10)
					},
					p02: {
						x: prevRightX,
						y: prevHeight
					},

					p10: {
						x: nextLeftX,
						y: nextHeight
					},
					p11: {
						x: centerX,
						y: nextHeight + curveHeight
					},
					p12: {
						x: nextRightX,
						y: nextHeight
					}
				};
			}

			/**
	   * @param {Object} p00
	   * @param {Object} p01
	   * @param {Object} p02
	   * @param {Object} p10
	   * @param {Object} p11
	   * @param {Object} p12
	   * @param {Number} ratio
	   *
	   * @return {Array}
	   */

		}, {
			key: 'makeBezierPath',
			value: function makeBezierPath(_ref2) {
				var p00 = _ref2.p00;
				var p01 = _ref2.p01;
				var p02 = _ref2.p02;
				var p10 = _ref2.p10;
				var p11 = _ref2.p11;
				var p12 = _ref2.p12;
				var ratio = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

				var curve0 = this.getQuadraticBezierCurve(p00, p01, p02, ratio);
				var curve1 = this.getQuadraticBezierCurve(p10, p11, p12, ratio);

				return [
				// Top Bezier curve
				[curve0.p0.x, curve0.p0.y, 'M'], [curve0.p1.x, curve0.p1.y, 'Q'], [curve0.p2.x, curve0.p2.y, ''],
				// Right line
				[curve1.p2.x, curve1.p2.y, 'L'],
				// Bottom Bezier curve
				[curve1.p2.x, curve1.p2.y, 'M'], [curve1.p1.x, curve1.p1.y, 'Q'], [curve1.p0.x, curve1.p0.y, ''],
				// Left line
				[curve0.p0.x, curve0.p0.y, 'L']];
			}

			/**
	   * @param {Object} p0
	   * @param {Object} p1
	   * @param {Object} p2
	   * @param {Number} t
	   *
	   * @return {Object}
	   */

		}, {
			key: 'getQuadraticBezierCurve',
			value: function getQuadraticBezierCurve(p0, p1, p2) {
				var t = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

				// Quadratic Bezier curve syntax: M(P0) Q(P1) P2
				// Where P0, P2 are the curve endpoints and P1 is the control point

				// More generally, at 0 <= t <= 1, we have the following:
				// Q0(t), which varies linearly from P0 to P1
				// Q1(t), which varies linearly from P1 to P2
				// B(t), which is interpolated linearly between Q0(t) and Q1(t)

				// For an intermediate curve at 0 <= t <= 1:
				// P1(t) = Q0(t)
				// P2(t) = B(t)

				return {
					p0: p0,
					p1: {
						x: this.getLinearInterpolation(p0, p1, t, 'x'),
						y: this.getLinearInterpolation(p0, p1, t, 'y')
					},
					p2: {
						x: this.getQuadraticInterpolation(p0, p1, p2, t, 'x'),
						y: this.getQuadraticInterpolation(p0, p1, p2, t, 'y')
					}
				};
			}

			/**
	   * @param {Object} p0
	   * @param {Object} p1
	   * @param {Number} t
	   * @param {string} axis
	   *
	   * @return {Number}
	   */

		}, {
			key: 'getLinearInterpolation',
			value: function getLinearInterpolation(p0, p1, t, axis) {
				return p0[axis] + t * (p1[axis] - p0[axis]);
			}

			/**
	   * @param {Object} p0
	   * @param {Object} p1
	   * @param {Object} p2
	   * @param {Number} t
	   * @param {string} axis
	   *
	   * @return {Number}
	   */

		}, {
			key: 'getQuadraticInterpolation',
			value: function getQuadraticInterpolation(p0, p1, p2, t, axis) {
				return Math.pow(1 - t, 2) * p0[axis] + 2 * (1 - t) * t * p1[axis] + Math.pow(t, 2) * p2[axis];
			}

			/**
	   * @param {Number}  prevLeftX
	   * @param {Number}  prevRightX
	   * @param {Number}  prevHeight
	   * @param {Number}  nextLeftX
	   * @param {Number}  nextRightX
	   * @param {Number}  nextHeight
	   * @param {Number}  ratio
	   * @param {boolean} isValueOverlay
	   *
	   * @return {Object}
	   */

		}, {
			key: 'makeStraightPaths',
			value: function makeStraightPaths(_ref3) {
				var prevLeftX = _ref3.prevLeftX;
				var prevRightX = _ref3.prevRightX;
				var prevHeight = _ref3.prevHeight;
				var nextLeftX = _ref3.nextLeftX;
				var nextRightX = _ref3.nextRightX;
				var nextHeight = _ref3.nextHeight;
				var ratio = _ref3.ratio;
				var isValueOverlay = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

				if (isValueOverlay) {
					var lengthTop = prevRightX - prevLeftX;
					var lengthBtm = nextRightX - nextLeftX;
					var rightSideTop = lengthTop * (ratio || 0) + prevLeftX;
					var rightSideBtm = lengthBtm * (ratio || 0) + nextLeftX;

					// Overlay should not be longer than the max length of the path
					rightSideTop = Math.min(rightSideTop, lengthTop);
					rightSideBtm = Math.min(rightSideBtm, lengthBtm);

					return [
					// Start position
					[prevLeftX, prevHeight, 'M'],
					// Move to right
					[rightSideTop, prevHeight, 'L'],
					// Move down
					[rightSideBtm, nextHeight, 'L'],
					// Move to left
					[nextLeftX, nextHeight, 'L'],
					// Wrap back to top
					[prevLeftX, prevHeight, 'L']];
				}

				return [
				// Start position
				[prevLeftX, prevHeight, 'M'],
				// Move to right
				[prevRightX, prevHeight, 'L'],
				// Move down
				[nextRightX, nextHeight, 'L'],
				// Move to left
				[nextLeftX, nextHeight, 'L'],
				// Wrap back to top
				[prevLeftX, prevHeight, 'L']];
			}
		}]);

		return Navigator;
	}();

	exports.default = Navigator;

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Utils = function () {
		function Utils() {
			_classCallCheck(this, Utils);
		}

		_createClass(Utils, null, [{
			key: 'isExtendableObject',

			/**
	   * Determine whether the given parameter is an extendable object.
	   *
	   * @param {*} a
	   *
	   * @return {boolean}
	   */
			value: function isExtendableObject(a) {
				return (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object' && a !== null && !Array.isArray(a);
			}

			/**
	   * Extends an object with the members of another.
	   *
	   * @param {Object} a The object to be extended.
	   * @param {Object} b The object to clone from.
	   *
	   * @return {Object}
	   */

		}, {
			key: 'extend',
			value: function extend(a, b) {
				var result = {};

				// If a is non-trivial, extend the result with it
				if (Object.keys(a).length > 0) {
					result = Utils.extend({}, a);
				}

				// Copy over the properties in b into a
				Object.keys(b).forEach(function (prop) {
					if (Utils.isExtendableObject(b[prop])) {
						if (Utils.isExtendableObject(a[prop])) {
							result[prop] = Utils.extend(a[prop], b[prop]);
						} else {
							result[prop] = Utils.extend({}, b[prop]);
						}
					} else {
						result[prop] = b[prop];
					}
				});

				return result;
			}
		}]);

		return Utils;
	}();

	exports.default = Utils;

/***/ }
/******/ ])
});
;