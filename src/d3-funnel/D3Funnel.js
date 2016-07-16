import d3 from 'd3';

import Colorizer from './Colorizer';
import LabelFormatter from './LabelFormatter';
import Navigator from './Navigator';
import Utils from './Utils';

class D3Funnel {
	static defaults = {
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
				height: 20,
			},
			totalCount: null,
		},
		block: {
			dynamicHeight: false,
			dynamicSlope: false,
			barOverlay: false,
			fill: {
				scale: d3.scale.category10().domain(d3.range(0, 10)),
				type: 'solid',
			},
			minHeight: 0,
			highlight: false,
		},
		label: {
			fontFamily: null,
			fontSize: '14px',
			fill: '#fff',
			format: '{l}: {f}',
		},
		events: {
			click: {
				block: null,
			},
		},
	};

	/**
	 * @param {string} selector A selector for the container element.
	 *
	 * @return {void}
	 */
	constructor(selector) {
		this.selector = selector;

		this.colorizer = new Colorizer();

		this.labelFormatter = new LabelFormatter();

		this.navigator = new Navigator();
	}

	/**
	 * Remove the funnel and its events from the DOM.
	 *
	 * @return {void}
	 */
	destroy() {
		const container = d3.select(this.selector);

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
	draw(data, options = {}) {
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
	initialize(data, options) {
		this.validateData(data);

		const settings = this.getSettings(options);

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
	validateData(data) {
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
	getSettings(options) {
		// Prepare the configuration settings based on the defaults
		// Set the default width and height based on the container
		let settings = Utils.extend({}, D3Funnel.defaults);
		settings.chart.width = parseInt(d3.select(this.selector).style('width'), 10);
		settings.chart.height = parseInt(d3.select(this.selector).style('height'), 10);

		// Overwrite default settings with user options
		settings = Utils.extend(settings, options);

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
	setBlocks(data) {
		const totalCount = this.getTotalCount(data);

		this.blocks = this.standardizeData(data, totalCount);
	}

	/**
	 * Return the total count of all blocks.
	 *
	 * @param {Array} data
	 *
	 * @return {Number}
	 */
	getTotalCount(data) {
		if (this.totalCount !== null) {
			return this.totalCount || 0;
		}

		let total = 0;

		data.forEach((block) => {
			total += this.getRawBlockCount(block);
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
	standardizeData(data, totalCount) {
		const standardized = [];

		data.forEach((block, index) => {
			const count = this.getRawBlockCount(block);
			const ratio = (count / totalCount) || 0;
			const label = block[0];

			standardized.push({
				index,
				ratio,
				value: count,
				height: this.height * ratio,
				fill: this.colorizer.getBlockFill(block, index, this.fillType),
				label: {
					raw: label,
					formatted: this.labelFormatter.format(label, block[1]),
					color: this.colorizer.getLabelFill(block),
				},
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
	getRawBlockCount(block) {
		return Array.isArray(block[1]) ? block[1][0] : block[1];
	}

	/**
	 * @return {Number}
	 */
	getDx() {
		// Will be sharper if there is a pinch
		if (this.bottomPinch > 0) {
			return this.bottomLeftX / (this.blocks.length - this.bottomPinch);
		}

		return this.bottomLeftX / this.blocks.length;
	}

	/**
	 * @return {Number}
	 */
	getDy() {
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
	drawOntoDom() {
		// Add the SVG
		this.svg = d3.select(this.selector)
			.append('svg')
			.attr('width', this.width)
			.attr('height', this.height);

		const newPaths = this.makePaths();
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
	 * Create the paths to be used to define the discrete funnel blocks and
	 * returns the results in an array.
	 *
	 * @return {Array, Array}
	 */
	makePaths() {
		let paths = [];
		let overlayPaths = [];

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

		const centerX = this.width / 2;

		// Move down if there is an initial curve
		if (this.isCurved) {
			prevHeight = 10;
		}

		let totalHeight = this.height;

		// This is greedy in that the block will have a guaranteed height
		// and the remaining is shared among the ratio, instead of being
		// shared according to the remaining minus the guaranteed
		if (this.minHeight !== 0) {
			totalHeight = this.height - this.minHeight * this.blocks.length;
		}

		let slopeHeight = this.height;

		// Correct slope height if there are blocks being pinched (and thus
		// requiring a sharper curve)
		this.blocks.forEach((block, i) => {
			if (this.bottomPinch > 0) {
				if (this.isInverted) {
					if (i < this.bottomPinch) {
						slopeHeight -= block.height;
					}
				} else if (i >= this.blocks.length - this.bottomPinch) {
					slopeHeight -= block.height;
				}
			}
		});

		// The slope will determine the where the x points on each block
		// iteration
		const slope = 2 * slopeHeight / (this.width - this.bottomWidth);

		// Create the path definition for each funnel block
		// Remember to loop back to the beginning point for a closed path
		this.blocks.forEach((block, i) => {
			// Make heights proportional to block weight
			if (this.dynamicHeight) {
				// Slice off the height proportional to this block
				dy = totalHeight * block.ratio;

				// Add greedy minimum height
				if (this.minHeight !== 0) {
					dy += this.minHeight;
				}

				// Account for any curvature
				if (this.isCurved) {
					dy = dy - (this.curveHeight / this.blocks.length);
				}

				// Given: y = mx + b
				// Given: b = 0 (when funnel), b = this.height (when pyramid)
				// For funnel, x_i = y_i / slope
				nextLeftX = (prevHeight + dy) / slope;

				// For pyramid, x_i = y_i - this.height / -slope
				if (this.isInverted) {
					nextLeftX = (prevHeight + dy - this.height) / (-1 * slope);
				}

				// If bottomWidth is 0, adjust last x position (to circumvent
				// errors associated with rounding)
				if (this.bottomWidth === 0 && i === this.blocks.length - 1) {
					// For funnel, last position is the center
					nextLeftX = this.width / 2;

					// For pyramid, last position is the origin
					if (this.isInverted) {
						nextLeftX = 0;
					}
				}

				// If bottomWidth is same as width, stop x velocity
				if (this.bottomWidth === this.width) {
					nextLeftX = prevLeftX;
				}

				// Calculate the shift necessary for both x points
				dx = nextLeftX - prevLeftX;

				if (this.isInverted) {
					dx = prevLeftX - nextLeftX;
				}
			}

			// Make slope width proportional to block value decrease
			if (this.dynamicSlope) {
				const nextBlockValue = this.blocks[i + 1] ?
					this.blocks[i + 1].value :
					block.value;

				const widthPercent = 1 - (nextBlockValue / block.value);
				dx = widthPercent * (centerX - prevLeftX);
			}

			// Stop velocity for pinched blocks
			if (this.bottomPinch > 0) {
				// Check if we've reached the bottom of the pinch
				// If so, stop changing on x
				if (!this.isInverted) {
					if (i >= this.blocks.length - this.bottomPinch) {
						dx = 0;
					}
					// Pinch at the first blocks relating to the bottom pinch
					// Revert back to normal velocity after pinch
				} else {
					// Revert velocity back to the initial if we are using
					// static area's (prevents zero velocity if isInverted
					// and bottomPinch are non trivial and dynamicHeight is
					// false)
					if (!this.dynamicHeight) {
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

			const dimensions = {
				centerX,
				prevLeftX,
				prevRightX,
				prevHeight,
				nextLeftX,
				nextRightX,
				nextHeight,
				curveHeight: this.curveHeight,
				ratio: block.ratio,
			};

			if (this.isCurved) {
				paths = [...paths, this.navigator.makeCurvedPaths(dimensions)];

				if (this.addValueOverlay) {
					overlayPaths = [...overlayPaths, this.navigator.makeCurvedPaths(dimensions, true)];
				}
			} else {
				paths = [...paths, this.navigator.makeStraightPaths(dimensions)];

				if (this.addValueOverlay) {
					overlayPaths = [...overlayPaths, this.navigator.makeStraightPaths(dimensions, true)];
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
	defineColorGradients(svg) {
		const defs = svg.append('defs');

		// Create a gradient for each block
		this.blocks.forEach((block, index) => {
			const color = block.fill.raw;
			const shade = this.colorizer.shade(color, -0.2);

			// Create linear gradient
			const gradient = defs.append('linearGradient')
				.attr({
					id: `gradient-${index}`,
				});

			// Define the gradient stops
			const stops = [
				[0, shade],
				[40, color],
				[60, color],
				[100, shade],
			];

			// Add the gradient stops
			stops.forEach((stop) => {
				gradient.append('stop').attr({
					offset: `${stop[0]}%`,
					style: `stop-color: ${stop[1]}`,
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
	drawTopOval(svg, blockPaths) {
		let leftX = 0;
		let rightX = this.width;
		const centerX = this.width / 2;

		if (this.isInverted) {
			leftX = this.bottomLeftX;
			rightX = this.width - this.bottomLeftX;
		}

		// Create path from top-most block
		const paths = blockPaths[0];
		const topCurve = paths[1][1] + this.curveHeight - 10;

		const path = this.navigator.plot([
			['M', leftX, paths[0][1]],
			['Q', centerX, topCurve],
			[' ', rightX, paths[2][1]],
			['M', rightX, 10],
			['Q', centerX, 0],
			[' ', leftX, 10],
		]);

		// Draw top oval
		svg.append('path')
			.attr('fill', this.colorizer.shade(this.blocks[0].fill.raw, -0.4))
			.attr('d', path);
	}

	/**
	 * Draw the next block in the iteration.
	 *
	 * @param {int} index
	 *
	 * @return {void}
	 */
	drawBlock(index) {
		if (index === this.blocks.length) {
			return;
		}

		// Create a group just for this block
		const group = this.svg.append('g');

		// Fetch path element
		const path = this.getBlockPath(group, index);

		// Attach data to the element
		this.attachData(path, this.blocks[index]);

		let overlayPath = null;
		let pathColor = this.blocks[index].fill.actual;

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
			path.transition()
				.duration(this.animation)
				.ease('linear')
				.attr('fill', pathColor)
				.attr('d', this.getPathDefinition(index))
				.each('end', () => {
					this.drawBlock(index + 1);
				});
		} else {
			path.attr('fill', pathColor)
				.attr('d', this.getPathDefinition(index));
			this.drawBlock(index + 1);
		}

		// Add path overlay
		if (this.addValueOverlay) {
			path.attr('stroke', this.blocks[index].fill.raw);

			if (this.animation !== 0) {
				overlayPath.transition()
					.duration(this.animation)
					.ease('linear')
					.attr('fill', this.blocks[index].fill.actual)
					.attr('d', this.getOverlayPathDefinition(index));
			} else {
				overlayPath.attr('fill', this.blocks[index].fill.actual)
					.attr('d', this.getOverlayPathDefinition(index));
			}
		}

		// Add the hover events
		if (this.hoverEffects) {
			[path, overlayPath].forEach((target) => {
				if (!target) {
					return;
				}

				target.on('mouseover', this.onMouseOver.bind(this))
					.on('mouseout', this.onMouseOut.bind(this));
			});
		}

		// Add block click event
		if (this.onBlockClick !== null) {
			[path, overlayPath].forEach((target) => {
				if (!target) {
					return;
				}

				target.on('click', this.onBlockClick);
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
	getBlockPath(group, index) {
		const path = group.append('path');

		if (this.animation !== 0) {
			this.addBeforeTransition(path, index);
		}

		return path;
	}

	/**
	 * @param {Object} group
	 * @param {int}    index
	 *
	 * @return {Object}
	 */
	getOverlayPath(group, index) {
		const path = group.append('path');

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
	addBeforeTransition(path, index, isOverlay) {
		const paths = isOverlay ? this.overlayPaths[index] : this.blockPaths[index];

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
		if (this.fillType === 'solid' && index > 0) {
			beforeFill = this.blocks[index - 1].fill.actual;
			// Otherwise use current background
		} else {
			beforeFill = this.blocks[index].fill.actual;
		}

		path.attr('d', beforePath)
			.attr('fill', beforeFill);
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
	attachData(element, data) {
		const nodeData = {
			...data,
			node: element.node(),
		};

		element.data([nodeData]);
	}

	/**
	 * @param {int} index
	 *
	 * @return {string}
	 */
	getPathDefinition(index) {
		const commands = [];

		this.blockPaths[index].forEach((command) => {
			commands.push([command[2], command[0], command[1]]);
		});

		return this.navigator.plot(commands);
	}

	/**
	 * @param {int} index
	 *
	 * @return {string}
	 */
	getOverlayPathDefinition(index) {
		const commands = [];

		this.overlayPaths[index].forEach((command) => {
			commands.push([command[2], command[0], command[1]]);
		});

		return this.navigator.plot(commands);
	}

	/**
	 * @param {Object} data
	 *
	 * @return {void}
	 */
	onMouseOver(data) {
		const children = d3.event.target.parentElement.childNodes;

		for (let i = 0; i < children.length; i++) {
			// Highlight all paths within one block
			const node = children[i];

			if (node.nodeName.toLowerCase() === 'path') {
				const type = node.getAttribute('pathType') || '';

				if (type === 'foreground') {
					d3.select(node).attr('fill', this.colorizer.shade(data.fill.raw, -0.5));
				} else {
					d3.select(node).attr('fill', this.colorizer.shade(data.fill.raw, -0.2));
				}
			}
		}
	}

	/**
	 * @param {Object} data
	 *
	 * @return {void}
	 */
	onMouseOut(data) {
		const children = d3.event.target.parentElement.childNodes;

		for (let i = 0; i < children.length; i++) {
			// Restore original color for all paths of a block
			const node = children[i];

			if (node.nodeName.toLowerCase() === 'path') {
				const type = node.getAttribute('pathType') || '';

				if (type === 'background') {
					const backgroundColor = this.colorizer.shade(data.fill.raw, 0.3);
					d3.select(node).attr('fill', backgroundColor);
				} else {
					d3.select(node).attr('fill', data.fill.actual);
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
	addBlockLabel(group, index) {
		const paths = this.blockPaths[index];

		const text = this.blocks[index].label.formatted;
		const fill = this.blocks[index].label.color;

		const x = this.width / 2;  // Center the text
		const y = this.getTextY(paths);

		const label = group.append('text')
			.text(text)
			.attr({
				x,
				y,
				fill,
				'text-anchor': 'middle',
				'dominant-baseline': 'middle',
				'pointer-events': 'none',
			})
			.attr('font-size', this.label.fontSize);

		if (this.label.fontFamily !== null) {
			label.attr('font-family', this.label.fontFamily);
		}
	}

	/**
	 * Returns the y position of the given label's text. This is determined by
	 * taking the mean of the bases.
	 *
	 * @param {Array} paths
	 *
	 * @return {Number}
	 */
	getTextY(paths) {
		if (this.isCurved) {
			return (paths[2][1] + paths[3][1]) / 2 + (this.curveHeight / this.blocks.length);
		}

		return (paths[1][1] + paths[2][1]) / 2;
	}
}

export default D3Funnel;
