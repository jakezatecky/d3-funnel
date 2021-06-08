import { easeLinear } from 'd3-ease';
import { range } from 'd3-array';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import 'd3-transition';
import { nanoid } from 'nanoid';

import Colorizer from './Colorizer';
import Formatter from './Formatter';
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
                shade: -0.4,
            },
            totalCount: null,
        },
        block: {
            dynamicHeight: false,
            dynamicSlope: false,
            barOverlay: false,
            fill: {
                scale: scaleOrdinal(schemeCategory10).domain(range(0, 10)),
                type: 'solid',
            },
            minHeight: 0,
            highlight: false,
        },
        label: {
            enabled: true,
            fontFamily: null,
            fontSize: '14px',
            fill: '#fff',
            format: '{l}: {f}',
        },
        tooltip: {
            enabled: false,
            format: '{l}: {f}',
        },
        events: {
            click: {
                block: null,
            },
        },
    };

    /**
     * @param {string|HTMLElement} selector A selector for the container element.
     *
     * @return {void}
     */
    constructor(selector) {
        this.container = select(selector).node();

        this.colorizer = new Colorizer();
        this.formatter = new Formatter();
        this.navigator = new Navigator();

        this.id = null;

        // Bind event handlers
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
    }

    /**
     * Remove the funnel and its events from the DOM.
     *
     * @return {void}
     */
    destroy() {
        const container = select(this.container);

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

        this.id = `d3-funnel-${nanoid()}`;

        // Set labels
        this.labelFormatter = this.formatter.getFormatter(settings.label.format);
        this.tooltipFormatter = this.formatter.getFormatter(settings.tooltip.format);

        // Set color scales
        this.colorizer.setInstanceId(this.id);
        this.colorizer.setLabelFill(settings.label.fill);
        this.colorizer.setScale(settings.block.fill.scale);

        // Initialize funnel chart settings
        this.settings = {
            width: settings.chart.width,
            height: settings.chart.height,
            bottomWidth: settings.chart.width * settings.chart.bottomWidth,
            bottomPinch: settings.chart.bottomPinch,
            isInverted: settings.chart.inverted,
            isCurved: settings.chart.curve.enabled,
            curveHeight: settings.chart.curve.height,
            curveShade: settings.chart.curve.shade,
            addValueOverlay: settings.block.barOverlay,
            animation: settings.chart.animate,
            totalCount: settings.chart.totalCount,
            fillType: settings.block.fill.type,
            hoverEffects: settings.block.highlight,
            dynamicHeight: settings.block.dynamicHeight,
            dynamicSlope: settings.block.dynamicSlope,
            minHeight: settings.block.minHeight,
            label: settings.label,
            tooltip: settings.tooltip,
            onBlockClick: settings.events.click.block,
        };

        this.setBlocks(data);
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

        if (typeof data[0] !== 'object') {
            throw new Error('Data array elements must be an object.');
        }

        if (
            (Array.isArray(data[0]) && data[0].length < 2) ||
            (Array.isArray(data[0]) === false && (
                data[0].label === undefined || data[0].value === undefined
            ))
        ) {
            throw new Error('Data array elements must contain a label and value.');
        }
    }

    /**
     * @param {Object} options
     *
     * @return {Object}
     */
    getSettings(options) {
        const containerDimensions = this.getContainerDimensions();
        const defaults = this.getDefaultSettings(containerDimensions);

        // Prepare the configuration settings based on the defaults
        let settings = Utils.extend({}, defaults);

        // Override default settings with user options
        settings = Utils.extend(settings, options);

        // Account for any percentage-based dimensions
        settings.chart = {
            ...settings.chart,
            ...this.castDimensions(settings, containerDimensions),
        };

        return settings;
    }

    /**
     * Return default settings.
     *
     * @param {Object} containerDimensions
     *
     * @return {Object}
     */
    getDefaultSettings(containerDimensions) {
        const settings = D3Funnel.defaults;

        // Set the default width and height based on the container
        settings.chart = {
            ...settings.chart,
            ...containerDimensions,
        };

        return settings;
    }

    /**
     * Get the width/height dimensions of the container.
     *
     * @return {{width: Number, height: Number}}
     */
    getContainerDimensions() {
        const dimensions = {
            width: parseFloat(select(this.container).style('width')),
            height: parseFloat(select(this.container).style('height')),
        };

        // Remove container dimensions that resolve to zero
        ['width', 'height'].forEach((direction) => {
            if (dimensions[direction] === 0) {
                delete dimensions[direction];
            }
        });

        return dimensions;
    }

    /**
     * Cast dimensions into tangible or meaningful numbers.
     *
     * @param {Object} chart
     * @param {Object} containerDimensions
     *
     * @return {{width: Number, height: Number}}
     */
    castDimensions({ chart }, containerDimensions) {
        const dimensions = {};

        Object.keys(containerDimensions).forEach((direction) => {
            const chartDimension = chart[direction];
            const containerDimension = containerDimensions[direction];

            if (/%$/.test(String(chartDimension))) {
                // Convert string into a percentage of the container
                dimensions[direction] = (parseFloat(chartDimension) / 100) * containerDimension;
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
        if (this.settings.totalCount !== null) {
            return this.settings.totalCount || 0;
        }

        return data.reduce((a, b) => a + Utils.getRawBlockCount(b), 0);
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
        return data.map((rawBlock, index) => {
            const block = Array.isArray(rawBlock) ? Utils.convertLegacyBlock(rawBlock) : rawBlock;
            const ratio = totalCount > 0 ? (block.value / totalCount || 0) : 1 / data.length;

            return {
                index,
                ratio,
                value: block.value,
                height: this.settings.height * ratio,
                fill: this.colorizer.getBlockFill(
                    block.backgroundColor,
                    index,
                    this.settings.fillType,
                ),
                label: {
                    enabled: !block.hideLabel,
                    raw: block.label,
                    formatted: this.formatter.format(block, this.labelFormatter),
                    color: this.colorizer.getLabelColor(block.labelColor),
                },
                tooltip: {
                    enabled: block.enabled,
                    formatted: this.formatter.format(block, this.tooltipFormatter),
                },
            };
        });
    }

    /**
     * Draw the chart onto the DOM.
     *
     * @return {void}
     */
    drawOntoDom() {
        // Add the SVG
        this.svg = select(this.container)
            .append('svg')
            .attr('id', this.id)
            .attr('width', this.settings.width)
            .attr('height', this.settings.height);

        [this.blockPaths, this.overlayPaths] = this.makePaths();

        // Define color gradients
        if (this.settings.fillType === 'gradient') {
            this.defineColorGradients(this.svg);
        }

        // Add top oval if curved
        if (this.settings.isCurved) {
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
        // Calculate the important fixed positions
        const bottomLeftX = (this.settings.width - this.settings.bottomWidth) / 2;
        const centerX = this.settings.width / 2;

        let paths = [];
        let overlayPaths = [];

        // Calculate change in x, y direction
        this.dx = this.getDx(bottomLeftX);
        this.dy = this.getDy();

        // Initialize velocity
        let { dx, dy } = this;

        // Initialize starting positions
        let prevLeftX = 0;
        let prevRightX = this.settings.width;
        let prevHeight = 0;

        // Start from the bottom for inverted
        if (this.settings.isInverted) {
            prevLeftX = bottomLeftX;
            prevRightX = this.settings.width - bottomLeftX;
        }

        // Initialize next positions
        let nextLeftX = 0;
        let nextRightX = 0;
        let nextHeight = 0;

        // Move down if there is an initial curve
        if (this.settings.isCurved) {
            prevHeight = this.settings.curveHeight / 2;
        }

        let totalHeight = this.settings.height;

        // This is greedy in that the block will have a guaranteed height
        // and the remaining is shared among the ratio, instead of being
        // shared according to the remaining minus the guaranteed
        if (this.settings.minHeight !== 0) {
            totalHeight = this.settings.height - (this.settings.minHeight * this.blocks.length);
        }

        let slopeHeight = this.settings.height;

        // Correct slope height if there are blocks being pinched (and thus
        // requiring a sharper curve)
        if (this.settings.bottomPinch > 0) {
            this.blocks.forEach((block, i) => {
                let height = (totalHeight * block.ratio);

                // Add greedy minimum height
                if (this.settings.minHeight !== 0) {
                    height += this.settings.minHeight;
                }

                // Account for any curvature
                if (this.settings.isCurved) {
                    height += this.settings.curveHeight / this.blocks.length;
                }

                if (this.settings.isInverted) {
                    if (i < this.settings.bottomPinch) {
                        slopeHeight -= height;
                    }
                } else if (i >= this.blocks.length - this.settings.bottomPinch) {
                    slopeHeight -= height;
                }
            });
        }

        // The slope will determine the x points on each block iteration
        // Given: slope = (y1 - y2) / (x1 - x2)
        // (x1, y1) = (bottomLeftX, height)
        // (x2, y2) = (0, 0)
        const slope = slopeHeight / bottomLeftX;

        // Create the path definition for each funnel block
        // Remember to loop back to the beginning point for a closed path
        this.blocks.forEach((block, i) => {
            // Make heights proportional to block weight
            if (this.settings.dynamicHeight) {
                // Slice off the height proportional to this block
                dy = totalHeight * block.ratio;

                // Add greedy minimum height
                if (this.settings.minHeight !== 0) {
                    dy += this.settings.minHeight;
                }

                // Account for any curvature
                if (this.settings.isCurved) {
                    dy -= this.settings.curveHeight / this.blocks.length;
                }

                // Given: y = mx + b
                // Given: b = 0 (when funnel), b = this.settings.height (when pyramid)
                // For funnel, x_i = y_i / slope
                nextLeftX = (prevHeight + dy) / slope;

                // For pyramid, x_i = y_i - this.settings.height / -slope
                if (this.settings.isInverted) {
                    nextLeftX = ((prevHeight + dy) - this.settings.height) / (-1 * slope);
                }

                // If bottomWidth is 0, adjust last x position (to circumvent
                // errors associated with rounding)
                if (this.settings.bottomWidth === 0 && i === this.blocks.length - 1) {
                    // For funnel, last position is the center
                    nextLeftX = this.settings.width / 2;

                    // For pyramid, last position is the origin
                    if (this.settings.isInverted) {
                        nextLeftX = 0;
                    }
                }

                // If bottomWidth is same as width, stop x velocity
                if (this.settings.bottomWidth === this.settings.width) {
                    nextLeftX = prevLeftX;
                }

                // Prevent NaN or Infinite values (caused by zero heights)
                if (Number.isNaN(nextLeftX) || !Number.isFinite(nextLeftX)) {
                    nextLeftX = 0;
                }

                // Calculate the shift necessary for both x points
                dx = nextLeftX - prevLeftX;

                if (this.settings.isInverted) {
                    dx = prevLeftX - nextLeftX;
                }
            }

            // Make slope width proportional to change in block value
            if (this.settings.dynamicSlope && !this.settings.isInverted) {
                const nextBlockValue = this.blocks[i + 1] ?
                    this.blocks[i + 1].value :
                    block.value;

                const widthRatio = nextBlockValue / block.value;
                dx = (1 - widthRatio) * (centerX - prevLeftX);
            }

            // Stop velocity for pinched blocks
            if (this.settings.bottomPinch > 0) {
                // Check if we've reached the bottom of the pinch
                // If so, stop changing on x
                if (!this.settings.isInverted) {
                    if (i >= this.blocks.length - this.settings.bottomPinch) {
                        dx = 0;
                    }
                    // Pinch at the first blocks relating to the bottom pinch
                    // Revert back to normal velocity after pinch
                } else {
                    // Revert velocity back to the initial if we are using
                    // static heights (prevents zero velocity if isInverted
                    // and bottomPinch are non trivial and dynamicHeight is
                    // false)
                    if (!this.settings.dynamicHeight) {
                        ({ dx } = this);
                    }

                    dx = i < this.settings.bottomPinch ? 0 : dx;
                }
            }

            // Calculate the position of next block
            nextLeftX = prevLeftX + dx;
            nextRightX = prevRightX - dx;
            nextHeight = prevHeight + dy;

            this.blocks[i].height = dy;

            // Expand outward if inverted
            if (this.settings.isInverted) {
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
                curveHeight: this.settings.curveHeight,
                ratio: block.ratio,
            };

            if (this.settings.isCurved) {
                paths = [...paths, this.navigator.makeCurvedPaths(dimensions)];

                if (this.settings.addValueOverlay) {
                    overlayPaths = [
                        ...overlayPaths,
                        this.navigator.makeCurvedPaths(dimensions, true),
                    ];
                }
            } else {
                paths = [...paths, this.navigator.makeStraightPaths(dimensions)];

                if (this.settings.addValueOverlay) {
                    overlayPaths = [
                        ...overlayPaths,
                        this.navigator.makeStraightPaths(dimensions, true),
                    ];
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
     * @param {Number} bottomLeftX
     *
     * @return {Number}
     */
    getDx(bottomLeftX) {
        // Will be sharper if there is a pinch
        if (this.settings.bottomPinch > 0) {
            return bottomLeftX / (this.blocks.length - this.settings.bottomPinch);
        }

        return bottomLeftX / this.blocks.length;
    }

    /**
     * @return {Number}
     */
    getDy() {
        // Curved chart needs reserved pixels to account for curvature
        if (this.settings.isCurved) {
            return (this.settings.height - this.settings.curveHeight) / this.blocks.length;
        }

        return this.settings.height / this.blocks.length;
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
                .attr('id', this.colorizer.getGradientId(index));

            // Define the gradient stops
            const stops = [
                [0, shade],
                [40, color],
                [60, color],
                [100, shade],
            ];

            // Add the gradient stops
            stops.forEach((stop) => {
                gradient.append('stop')
                    .attr('offset', `${stop[0]}%`)
                    .attr('style', `stop-color: ${stop[1]}`);
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
        const centerX = this.settings.width / 2;

        // Create path from top-most block
        const paths = blockPaths[0];
        const topCurve = paths[1][1] + (this.settings.curveHeight / 2);

        const path = this.navigator.plot([
            ['M', paths[0][0], paths[0][1]],
            ['Q', centerX, topCurve],
            [' ', paths[2][0], paths[2][1]],
            ['M', paths[2][0], this.settings.curveHeight / 2],
            ['Q', centerX, 0],
            [' ', paths[0][0], this.settings.curveHeight / 2],
        ]);

        // Draw top oval
        svg.append('path')
            .attr('fill', this.colorizer.shade(this.blocks[0].fill.raw, this.settings.curveShade))
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
        const block = this.blocks[index];

        // Fetch path element
        const path = this.getBlockPath(group, index);

        // Attach data to the element
        this.attachData(path, block);

        let overlayPath = null;
        let pathColor = block.fill.actual;

        if (this.settings.addValueOverlay) {
            overlayPath = this.getOverlayPath(group, index);
            this.attachData(overlayPath, block);

            // Add data attribute to distinguish between paths
            path.node().setAttribute('pathType', 'background');
            overlayPath.node().setAttribute('pathType', 'foreground');

            // Default path becomes background of lighter shade
            pathColor = this.colorizer.shade(block.fill.raw, 0.3);
        }

        // Add animation components
        if (this.settings.animation !== 0) {
            path.transition()
                .duration(this.settings.animation)
                .ease(easeLinear)
                .attr('fill', pathColor)
                .attr('d', this.getPathDefinition(index))
                .on('end', () => {
                    this.drawBlock(index + 1);
                });
        } else {
            path.attr('fill', pathColor)
                .attr('d', this.getPathDefinition(index));
            this.drawBlock(index + 1);
        }

        // Add path overlay
        if (this.settings.addValueOverlay) {
            path.attr('stroke', this.blocks[index].fill.raw);

            if (this.settings.animation !== 0) {
                overlayPath.transition()
                    .duration(this.settings.animation)
                    .ease(easeLinear)
                    .attr('fill', block.fill.actual)
                    .attr('d', this.getOverlayPathDefinition(index));
            } else {
                overlayPath.attr('fill', block.fill.actual)
                    .attr('d', this.getOverlayPathDefinition(index));
            }
        }

        // Add the hover events
        if (this.settings.hoverEffects) {
            [path, overlayPath].forEach((target) => {
                if (!target) {
                    return;
                }

                target
                    .on('mouseover', this.onMouseOver)
                    .on('mouseout', this.onMouseOut);
            });
        }

        // Add block click event
        if (this.settings.onBlockClick !== null) {
            [path, overlayPath].forEach((target) => {
                if (!target) {
                    return;
                }

                target.style('cursor', 'pointer')
                    .on('click', this.settings.onBlockClick);
            });
        }

        // Add tooltips
        if (this.settings.tooltip.enabled) {
            [path, overlayPath].forEach((target) => {
                if (!target) {
                    return;
                }

                target.node().addEventListener('mouseout', () => {
                    if (this.tooltip) {
                        this.container.removeChild(this.tooltip);
                        this.tooltip = null;
                    }
                });
                target.node().addEventListener('mousemove', (e) => {
                    if (!this.tooltip) {
                        this.tooltip = document.createElement('div');
                        this.tooltip.setAttribute('class', 'd3-funnel-tooltip');
                        this.container.appendChild(this.tooltip);
                    }

                    this.tooltip.innerText = block.tooltip.formatted;

                    const width = this.tooltip.offsetWidth;
                    const height = this.tooltip.offsetHeight;
                    const rect = this.container.getBoundingClientRect();
                    const heightOffset = height + 5;
                    const containerY = rect.y + window.scrollY;
                    const isAbove = e.pageY - heightOffset < containerY;
                    const top = isAbove ? e.pageY + 5 : e.pageY - heightOffset;

                    const styles = [
                        'display: inline-block',
                        'position: absolute',
                        `left: ${e.pageX - (width / 2)}px`,
                        `top: ${top}px`,
                        `border: 1px solid ${block.fill.raw}`,
                        'background: rgb(255,255,255,0.75)',
                        'padding: 5px 15px',
                        'color: #000',
                        'font-size: 14px',
                        'font-weight: bold',
                        'text-align: center',
                        'cursor: default',
                        'pointer-events: none',
                    ];
                    this.tooltip.setAttribute('style', styles.join(';'));
                });
            });
        }

        if (this.settings.label.enabled && block.label.enabled) {
            this.addBlockLabel(group, index);
        }
    }

    /**
     * @param {Object} group
     * @param {int}    index
     *
     * @return {Object}
     */
    getBlockPath(group, index) {
        const path = group.append('path');

        if (this.settings.animation !== 0) {
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
    getOverlayPath(group, index) {
        const path = group.append('path');

        if (this.settings.animation !== 0) {
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
        if (!this.settings.isCurved) {
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
        if (this.settings.fillType === 'solid' && index > 0) {
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
     * @param {Object} event
     * @param {Object} data
     *
     * @return {void}
     */
    onMouseOver(event, data) {
        const children = event.target.parentElement.childNodes;

        // Highlight all paths within one block
        [...children].forEach((node) => {
            if (node.nodeName.toLowerCase() === 'path') {
                const type = node.getAttribute('pathType') || '';

                if (type === 'foreground') {
                    select(node).attr('fill', this.colorizer.shade(data.fill.raw, -0.5));
                } else {
                    select(node).attr('fill', this.colorizer.shade(data.fill.raw, -0.2));
                }
            }
        });
    }

    /**
     * @param {Object} event
     * @param {Object} data
     *
     * @return {void}
     */
    onMouseOut(event, data) {
        const children = event.target.parentElement.childNodes;

        // Restore original color for all paths of a block
        [...children].forEach((node) => {
            if (node.nodeName.toLowerCase() === 'path') {
                const type = node.getAttribute('pathType') || '';

                if (type === 'background') {
                    const backgroundColor = this.colorizer.shade(data.fill.raw, 0.3);
                    select(node).attr('fill', backgroundColor);
                } else {
                    select(node).attr('fill', data.fill.actual);
                }
            }
        });
    }

    /**
     * @param {Object} group
     * @param {int}    index
     *
     * @return {void}
     */
    addBlockLabel(group, index) {
        const paths = this.blockPaths[index];

        const formattedLabel = this.blocks[index].label.formatted;
        const fill = this.blocks[index].label.color;

        // Center the text
        const x = this.settings.width / 2;
        const y = this.getTextY(paths);

        const text = group.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('fill', fill)
            .attr('font-size', this.settings.label.fontSize)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('pointer-events', 'none');

        // Add font-family, if exists
        if (this.settings.label.fontFamily !== null) {
            text.attr('font-family', this.settings.label.fontFamily);
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
    addLabelLines(text, formattedLabel, x) {
        const lines = formattedLabel.split('\n');
        const lineHeight = 20;

        // dy will signify the change from the initial height y
        // We need to initially start the first line at the very top, factoring
        // in the other number of lines
        const initialDy = (-1 * lineHeight * (lines.length - 1)) / 2;

        lines.forEach((line, i) => {
            const dy = i === 0 ? initialDy : lineHeight;

            text.append('tspan').attr('x', x).attr('dy', dy).text(line);
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
    getTextY(paths) {
        const { isCurved, curveHeight } = this.settings;

        if (isCurved) {
            return ((paths[2][1] + paths[3][1]) / 2) + ((1.5 * curveHeight) / this.blocks.length);
        }

        return (paths[1][1] + paths[2][1]) / 2;
    }
}

export default D3Funnel;
