/* global d3, LabelFormatter, Navigator, Utils */
/* exported D3Funnel */

class D3Funnel {

	/**
	 * @param {string} selector A selector for the container element.
	 *
	 * @return {void}
	 */
	constructor(selector) {
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
				format: '{l}: {f}',
			},
			onItemClick: null,
		};

		this.labelFormatter = new LabelFormatter();

		this.navigator = new Navigator();
	}

	/**
	 * Remove the funnel and its events from the DOM.
	 *
	 * @return {void}
	 */
	destroy() {
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
	draw(data, options = {}) {
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
	_initialize(data, options) {
		this._validateData(data);

		this._setData(data);

		let settings = this._getSettings(options);

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
	_validateData(data) {
		if (Array.isArray(data) === false ||
			data.length === 0 ||
			Array.isArray(data[0]) === false ||
			data[0].length < 2) {
			throw new Error('Funnel data is not valid.');
		}
	}

	/**
	 * @param {Array} data
	 *
	 * @return void
	 */
	_setData(data) {
		this.data = data;

		this._setColors();
	}

	/**
	 * Set the colors for each block.
	 *
	 * @return {void}
	 */
	_setColors() {
		let colorScale = d3.scale.category10();
		let hexExpression = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

		// Add a color for for each block without one
		this.data.forEach((block, index) => {
			if (block.length < 3 || !hexExpression.test(block[2])) {
				this.data[index][2] = colorScale(index);
			}
		});
	}

	/**
	 * @param {Object} options
	 *
	 * @returns {Object}
	 */
	_getSettings(options) {
		// Prepare the configuration settings based on the defaults
		// Set the default width and height based on the container
		let settings = Utils.extend({}, this.defaults);
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
	_getDx() {
		// Will be sharper if there is a pinch
		if (this.bottomPinch > 0) {
			return this.bottomLeftX / (this.data.length - this.bottomPinch);
		}

		return this.bottomLeftX / this.data.length;
	}

	/**
	 * @return {Number}
	 */
	_getDy() {
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
	_draw() {
		// Add the SVG
		this.svg = d3.select(this.selector)
			.append('svg')
			.attr('width', this.width)
			.attr('height', this.height);

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
	_makePaths() {
		let paths = [];

		// Initialize velocity
		let dx = this.dx;
		let dy = this.dy;

		// Initialize starting positions
		let prevLeftX = 0;
		let prevRightX = this.width;
		let prevHeight = 0;

		// Start from the bottom for inverted
		if (this.isInverted) {
			prevLeftX = this.bottomLeftX;
			prevRightX = this.width - this.bottomLeftX;
		}

		// Initialize next positions
		let nextLeftX = 0;
		let nextRightX = 0;
		let nextHeight = 0;

		let middle = this.width / 2;

		// Move down if there is an initial curve
		if (this.isCurved) {
			prevHeight = 10;
		}

		let topBase = this.width;
		let bottomBase = 0;

		let totalArea = this.height * (this.width + this.bottomWidth) / 2;
		let slope = 2 * this.height / (this.width - this.bottomWidth);

		// This is greedy in that the block will have a guaranteed height
		// and the remaining is shared among the ratio, instead of being
		// shared according to the remaining minus the guaranteed
		if (this.minHeight !== false) {
			totalArea = (this.height - this.minHeight * this.data.length) * (this.width + this.bottomWidth) / 2;
		}

		let totalCount = 0;
		let count = 0;

		// Harvest total count
		this.data.forEach((block) => {
			totalCount += Array.isArray(block[1]) ? block[1][0] : block[1];
		});

		// Create the path definition for each funnel block
		// Remember to loop back to the beginning point for a closed path
		this.data.forEach((block, i) => {
			count = Array.isArray(block[1]) ? block[0] : block[1];

			// Calculate dynamic shapes based on area
			if (this.dynamicArea) {
				let ratio = count / totalCount;
				let area = ratio * totalArea;

				if (this.minHeight !== false) {
					area += this.minHeight * (this.width + this.bottomWidth) / 2;
				}

				bottomBase = Math.sqrt((slope * topBase * topBase - (4 * area)) / slope);

				// Prevent NaN slope
				if (this.bottomWidth === this.width) {
					bottomBase = topBase;
				}

				dx = (topBase / 2) - (bottomBase / 2);
				dy = (area * 2) / (topBase + bottomBase);

				if (this.isCurved) {
					dy = dy - (this.curveHeight / this.data.length);
				}

				topBase = bottomBase;
			}

			// Stop velocity for pinched blocks
			if (this.bottomPinch > 0) {
				// Check if we've reached the bottom of the pinch
				// If so, stop changing on x
				if (!this.isInverted) {
					if (i >= this.data.length - this.bottomPinch) {
						dx = 0;
					}
					// Pinch at the first blocks relating to the bottom pinch
					// Revert back to normal velocity after pinch
				} else {
					// Revert velocity back to the initial if we are using
					// static area's (prevents zero velocity if isInverted
					// and bottomPinch are non trivial and dynamicArea is
					// false)
					if (!this.dynamicArea) {
						dx = this.dx;
					}

					dx = i < this.bottomPinch ? 0 : dx;
				}
			}

			// Calculate the position of next block
			nextLeftX = prevLeftX + dx;
			nextRightX = prevRightX - dx;
			nextHeight = prevHeight + dy;

			// Expand outward if inverted
			if (this.isInverted) {
				nextLeftX = prevLeftX - dx;
				nextRightX = prevRightX + dx;
			}

			// Plot curved lines
			if (this.isCurved) {
				paths.push([
					// Top Bezier curve
					[prevLeftX, prevHeight, 'M'],
					[middle, prevHeight + (this.curveHeight - 10), 'Q'],
					[prevRightX, prevHeight, ''],
					// Right line
					[nextRightX, nextHeight, 'L'],
					// Bottom Bezier curve
					[nextRightX, nextHeight, 'M'],
					[middle, nextHeight + this.curveHeight, 'Q'],
					[nextLeftX, nextHeight, ''],
					// Left line
					[prevLeftX, prevHeight, 'L'],
				]);
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
					[prevLeftX, prevHeight, 'L'],
				]);
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
	_defineColorGradients(svg) {
		let defs = svg.append('defs');

		// Create a gradient for each block
		this.data.forEach((block, index) => {
			let color = block[2];
			let shade = Utils.shadeColor(color, -0.25);

			// Create linear gradient
			let gradient = defs.append('linearGradient')
				.attr({
					id: 'gradient-' + index,
				});

			// Define the gradient stops
			let stops = [
				[0, shade],
				[40, color],
				[60, color],
				[100, shade],
			];

			// Add the gradient stops
			stops.forEach((stop) => {
				gradient.append('stop').attr({
					offset: stop[0] + '%',
					style: 'stop-color:' + stop[1],
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
	_drawTopOval(svg, blockPaths) {
		let leftX = 0;
		let rightX = this.width;
		let centerX = this.width / 2;

		if (this.isInverted) {
			leftX = this.bottomLeftX;
			rightX = this.width - this.bottomLeftX;
		}

		// Create path from top-most block
		let paths = blockPaths[0];
		let topCurve = paths[1][1] + this.curveHeight - 10;

		let path = this.navigator.plot([
			['M', leftX, paths[0][1]],
			['Q', centerX, topCurve],
			[' ', rightX, paths[2][1]],
			['M', rightX, 10],
			['Q', centerX, 0],
			[' ', leftX, 10],
		]);

		// Draw top oval
		svg.append('path')
			.attr('fill', Utils.shadeColor(this.data[0][2], -0.4))
			.attr('d', path);
	}

	/**
	 * Draw the next block in the iteration.
	 *
	 * @param {int} index
	 *
	 * @return {void}
	 */
	_drawBlock(index) {
		if (index === this.data.length) {
			return;
		}

		// Create a group just for this block
		let group = this.svg.append('g');

		// Fetch path element
		let path = this._getBlockPath(group, index);
		path.data(this._getBlockData(index));

		// Add animation components
		if (this.animation !== false) {
			path.transition()
				.duration(this.animation)
				.ease('linear')
				.attr('fill', this._getColor(index))
				.attr('d', this._getPathDefinition(index))
				.each('end', () => {
					this._drawBlock(index + 1);
				});
		} else {
			path.attr('fill', this._getColor(index))
				.attr('d', this._getPathDefinition(index));
			this._drawBlock(index + 1);
		}

		// Add the hover events
		if (this.hoverEffects) {
			path.on('mouseover', this._onMouseOver)
				.on('mouseout', this._onMouseOut);
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
	_getBlockPath(group, index) {
		let path = group.append('path');

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
	_addBeforeTransition(path, index) {
		let paths = this.blockPaths[index];

		let beforePath = '';
		let beforeFill = '';

		// Construct the top of the trapezoid and leave the other elements
		// hovering around to expand downward on animation
		if (!this.isCurved) {
			beforePath = this.navigator.plot([
				['M', paths[0][0], paths[0][1]],
				['L', paths[1][0], paths[1][1]],
				['L', paths[1][0], paths[1][1]],
				['L', paths[0][0], paths[0][1]],
			]);
		} else {
			beforePath = this.navigator.plot([
				['M', paths[0][0], paths[0][1]],
				['Q', paths[1][0], paths[1][1]],
				[' ', paths[2][0], paths[2][1]],
				['L', paths[2][0], paths[2][1]],
				['M', paths[2][0], paths[2][1]],
				['Q', paths[1][0], paths[1][1]],
				[' ', paths[0][0], paths[0][1]],
			]);
		}

		// Use previous fill color, if available
		if (this.fillType === 'solid') {
			beforeFill = index > 0 ? this._getColor(index - 1) : this._getColor(index);
			// Use current background if gradient (gradients do not transition)
		} else {
			beforeFill = this._getColor(index);
		}

		path.attr('d', beforePath)
			.attr('fill', beforeFill);
	}

	/**
	 * @param {int} index
	 *
	 * @return {Array}
	 */
	_getBlockData(index) {
		let label = this.data[index][0];
		let value = this.data[index][1];

		return [{
			index: index,
			label: label,
			value: value,
			formatted: this.labelFormatter.format(label, value),
			baseColor: this.data[index][2],
			fill: this._getColor(index),
		}];
	}

	/**
	 * Return the color for the given index.
	 *
	 * @param {int} index
	 *
	 * @return {string}
	 */
	_getColor(index) {
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
	_getPathDefinition(index) {
		let commands = [];

		this.blockPaths[index].forEach((command) => {
			commands.push([command[2], command[0], command[1]]);
		});

		return this.navigator.plot(commands);
	}

	/**
	 * @param {Object} data
	 *
	 * @return {void}
	 */
	_onMouseOver(data) {
		d3.select(this).attr('fill', Utils.shadeColor(data.baseColor, -0.2));
	}

	/**
	 * @param {Object} data
	 *
	 * @return {void}
	 */
	_onMouseOut(data) {
		d3.select(this).attr('fill', data.fill);
	}

	/**
	 * @param {Object} group
	 * @param {int}    index
	 *
	 * @return {void}
	 */
	_addBlockLabel(group, index) {
		let paths = this.blockPaths[index];

		let label = this._getBlockData(index)[0].formatted;
		let fill = this.data[index][3] || this.label.fill;

		let x = this.width / 2;  // Center the text
		let y = this._getTextY(paths);

		group.append('text')
			.text(label)
			.attr({
				'x': x,
				'y': y,
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'fill': fill,
				'pointer-events': 'none',
			})
			.style('font-size', this.label.fontSize);
	}

	/**
	 * Returns the y position of the given label's text. This is determined by
	 * taking the mean of the bases.
	 *
	 * @param {Array} paths
	 *
	 * @return {Number}
	 */
	_getTextY(paths) {
		if (this.isCurved) {
			return (paths[2][1] + paths[3][1]) / 2 + (this.curveHeight / this.data.length);
		}

		return (paths[1][1] + paths[2][1]) / 2;
	}

}
