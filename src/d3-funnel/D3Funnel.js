import { easeLinear } from 'd3-ease';
import { range } from 'd3-array';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import 'd3-transition';
import { nanoid } from 'nanoid';

import Colorizer from '#js/Colorizer.js';
import Formatter from '#js/Formatter.js';
import Navigator from '#js/Navigator.js';
import Tooltip from '#js/Tooltip.js';
import Utils from '#js/Utils.js';

class D3Funnel {
    static defaults = {
        chart: {
            width: 350,
            height: 400,
            neckWidth: 1 / 3,
            pinchedBlocks: 0,
            inverted: false,
            animation: {
                duration: 0,
            },
            curve: {
                enabled: false,
                depth: 20,
                shade: -0.4,
            },
            totalValue: null,
        },
        block: {
            proportionalHeight: false,
            proportionalWidth: false,
            barOverlay: {
                enabled: false,
                shade: 0.3,
            },
            fill: {
                colors: scaleOrdinal(schemeCategory10).domain(range(0, 10)),
                type: 'solid',
                gradientShade: -0.2,
            },
            minHeight: 0,
            gap: 0,
            highlight: {
                enabled: false,
                shade: -0.2,
            },
        },
        label: {
            enabled: true,
            fontFamily: null,
            fontSize: '14px',
            lineHeight: 1.4,
            color: '#fff',
            format: '{l}: {f}',
            verticalAlign: 'middle',
            overflow: 'visible',
            padding: 5,
        },
        tooltip: {
            enabled: false,
            format: '{l}: {f}',
            offset: 5,
            style: {
                background: 'rgb(255,255,255,0.75)',
                'border-style': 'solid',
                'border-width': '1px',
                color: '#000',
                'font-size': '14px',
                'font-weight': 'bold',
                padding: '5px 15px',
                'text-align': 'center',
            },
        },
        events: {
            click: {
                block: null,
            },
            mouseover: {
                block: null,
            },
            mouseout: {
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
        // Remove everything from the container, including any tooltip; event
        // listeners go along with the elements they are attached to
        this.container.replaceChildren();
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

        const containerDimensions = this.getContainerDimensions();

        this.options = this.getOptions(options, containerDimensions);

        // Calculate the pixel dimensions of the chart
        const { width, height } = this.castDimensions(containerDimensions);

        this.width = width;
        this.height = height;
        this.neckWidth = width * this.options.chart.neckWidth;

        this.id = `d3-funnel-${nanoid()}`;

        // Set color scales
        this.colorizer.setInstanceId(this.id);
        this.colorizer.setLabelColor(this.options.label.color);
        this.colorizer.setColors(this.options.block.fill.colors);

        this.blocks = this.standardizeData(data);
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

        if (Array.isArray(data[0])) {
            throw new Error('Data array elements must be objects; the legacy array format was removed in v3.');
        }

        if (data[0].label === undefined || data[0].value === undefined) {
            throw new Error('Data array elements must contain a label and value.');
        }
    }

    /**
     * Return the default options overridden by the given user options.
     *
     * @param {Object} options
     * @param {Object} containerDimensions
     *
     * @return {Object}
     */
    getOptions(options, containerDimensions) {
        return Utils.extend(this.getDefaultOptions(containerDimensions), options);
    }

    /**
     * Return the default options.
     *
     * @param {Object} containerDimensions
     *
     * @return {Object}
     */
    getDefaultOptions(containerDimensions) {
        // Set the default width and height based on the container, leaving
        // the static defaults untouched for future charts
        return Utils.extend(D3Funnel.defaults, { chart: containerDimensions });
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
     * Cast the chart's width and height options into pixels.
     *
     * @param {Object} containerDimensions
     *
     * @return {{width: Number, height: Number}}
     */
    castDimensions(containerDimensions) {
        const { chart } = this.options;
        const dimensions = {
            width: chart.width,
            height: chart.height,
        };

        Object.keys(containerDimensions).forEach((direction) => {
            const chartDimension = chart[direction];
            const containerDimension = containerDimensions[direction];

            if (/%$/.test(String(chartDimension))) {
                // Convert string into a percentage of the container
                dimensions[direction] = (parseFloat(chartDimension) / 100) * containerDimension;
            } else if (chartDimension <= 0) {
                // If case of non-positive number, set to a usable number
                dimensions[direction] = D3Funnel.defaults.chart[direction];
            }
        });

        return dimensions;
    }

    /**
     * Return the total value of all blocks.
     *
     * @param {Array} blocks
     *
     * @return {Number}
     */
    getTotalValue(blocks) {
        const { totalValue } = this.options.chart;

        if (totalValue !== null) {
            return totalValue || 0;
        }

        return blocks.reduce((total, block) => total + block.value, 0);
    }

    /**
     * Convert the raw data into a standardized format and pre-calculate some
     * values.
     *
     * @param {Array} data
     *
     * @return {Array}
     */
    standardizeData(data) {
        const { label, tooltip } = this.options;
        const totalValue = this.getTotalValue(data);

        return data.map((block, index) => {
            const ratio = totalValue > 0 ? (block.value / totalValue || 0) : 1 / data.length;

            return {
                index,
                data: block,
                ratio,
                value: block.value,
                fill: this.colorizer.getBlockFill(
                    block.fillColor,
                    index,
                    this.options.block.fill.type,
                ),
                label: {
                    enabled: !block.hideLabel,
                    raw: block.label,
                    formatted: Formatter.format(block, label.format),
                    color: this.colorizer.getLabelColor(block.labelColor),
                    fontSize: block.labelFontSize ?? label.fontSize,
                    fontFamily: block.labelFontFamily ?? label.fontFamily,
                },
                tooltip: {
                    formatted: Formatter.format(block, tooltip.format),
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
        const { chart, block } = this.options;

        // Add the SVG
        this.svg = select(this.container)
            .append('svg')
            .attr('id', this.id)
            .attr('width', this.width)
            .attr('height', this.height);

        [this.blockPaths, this.overlayPaths] = this.makePaths();

        // The <g> element of each block, filled in as the blocks are drawn
        this.blockGroups = [];

        // A fresh tooltip for each drawing, as the previous one is removed
        // along with the rest of the chart
        this.tooltip = new Tooltip(this.container, this.options.tooltip);

        // Define color gradients
        if (block.fill.type === 'gradient') {
            this.defineColorGradients(this.svg);
        }

        // Add top oval if curved
        if (chart.curve.enabled) {
            this.drawTopOval(this.svg, 0);
        }

        // Add each block; animated blocks draw each other in turn, once the
        // block before them finishes
        if (chart.animation.duration !== 0) {
            this.drawBlock(0);
        } else {
            this.blocks.forEach((data, index) => this.drawBlock(index));
        }
    }

    /**
     * Create the paths to be used to define the discrete funnel blocks and
     * returns the results in an array.
     *
     * @return {Array, Array}
     */
    makePaths() {
        const { inverted, pinchedBlocks, curve } = this.options.chart;
        const {
            minHeight,
            proportionalHeight,
            proportionalWidth,
            gap,
            barOverlay,
        } = this.options.block;

        // Calculate the important fixed positions
        const neckLeftX = (this.width - this.neckWidth) / 2;
        const centerX = this.width / 2;

        const paths = [];
        const overlayPaths = [];

        // The change in x, y direction of each block, unless adjusted below
        const initialDx = this.getDx(neckLeftX);
        const initialDy = this.getDy();

        // Start from the bottom for inverted
        let prevLeftX = inverted ? neckLeftX : 0;
        let prevRightX = this.width - prevLeftX;

        // Move down to make room for the back of the top oval
        let prevHeight = curve.enabled ? this.getCurveDepth(this.getTopEdgeWidth()) : 0;

        // This is greedy in that the block will have a guaranteed height
        // and the remaining is shared among the ratio, instead of being
        // shared according to the remaining minus the guaranteed
        const totalHeight = this.height - (minHeight * this.blocks.length);

        // The top and bottom edges of the funnel's sides
        const topY = prevHeight;
        const bottomY = curve.enabled ?
            this.height - this.getCurveDepth(this.getBottomEdgeWidth()) :
            this.height;

        // Get the proportional height of a block
        const getBlockHeight = (block) => {
            // Slice off the height proportional to this block and add the
            // greedy minimum height
            let height = (totalHeight * block.ratio) + minHeight;

            // Account for any curvature
            if (curve.enabled) {
                height -= this.getCurveReserve() / this.blocks.length;
            }

            return height;
        };

        // Pinched blocks sit at the narrow end of the funnel and keep its width
        const isPinched = (i) => (
            inverted ?
                i < pinchedBlocks :
                i >= this.blocks.length - pinchedBlocks
        );

        // Correct slope height if there are blocks being pinched (and thus
        // requiring a sharper curve)
        const pinchHeight = this.blocks
            .filter((block, i) => isPinched(i))
            .reduce((total, block) => total + getBlockHeight(block), 0);

        const makeBlockPaths = curve.enabled ?
            (dimensions, isOverlay) => this.navigator.makeCurvedPaths(dimensions, isOverlay) :
            (dimensions, isOverlay) => this.navigator.makeStraightPaths(dimensions, isOverlay);

        // The slope will determine the x points on each block iteration
        // Given: slope = (y1 - y2) / (x1 - x2)
        // (x1, y1) = (neckLeftX, the start of any pinch)
        // (x2, y2) = (0, the far edge of the funnel)
        const slope = (bottomY - topY - pinchHeight) / neckLeftX;

        // Create the path definition for each funnel block
        // Remember to loop back to the beginning point for a closed path
        this.blocks.forEach((block, i) => {
            let dx = initialDx;
            let dy = initialDy;

            // Make heights proportional to block weight
            if (proportionalHeight) {
                dy = getBlockHeight(block);

                // Given: y = mx + b
                // Given: b = topY (when funnel), b = bottomY (when pyramid)
                // For funnel, x_i = (y_i - topY) / slope
                let targetLeftX = ((prevHeight + dy) - topY) / slope;

                // For pyramid, x_i = (y_i - bottomY) / -slope
                if (inverted) {
                    targetLeftX = ((prevHeight + dy) - bottomY) / (-1 * slope);
                }

                // If neckWidth is 0, adjust last x position (to circumvent
                // errors associated with rounding)
                if (this.neckWidth === 0 && i === this.blocks.length - 1) {
                    // For funnel, last position is the center
                    targetLeftX = this.width / 2;

                    // For pyramid, last position is the origin
                    if (inverted) {
                        targetLeftX = 0;
                    }
                }

                // If neckWidth is same as width, stop x velocity
                if (this.neckWidth === this.width) {
                    targetLeftX = prevLeftX;
                }

                // Prevent NaN or Infinite values (caused by zero heights)
                if (!Number.isFinite(targetLeftX)) {
                    targetLeftX = 0;
                }

                // Calculate the shift necessary for both x points
                dx = targetLeftX - prevLeftX;

                if (inverted) {
                    dx = prevLeftX - targetLeftX;
                }
            }

            // Make slope width proportional to change in block value
            if (proportionalWidth && !inverted) {
                const nextBlockValue = this.blocks[i + 1] ?
                    this.blocks[i + 1].value :
                    block.value;

                const widthRatio = nextBlockValue / block.value;
                dx = (1 - widthRatio) * (centerX - prevLeftX);
            }

            // Stop velocity for pinched blocks
            if (isPinched(i)) {
                dx = 0;
            }

            // Calculate the position of next block, expanding outward if
            // inverted
            const nextLeftX = inverted ? prevLeftX - dx : prevLeftX + dx;
            const nextRightX = inverted ? prevRightX + dx : prevRightX - dx;
            const nextHeight = prevHeight + dy;

            this.blocks[i].height = dy;

            const edges = this.carveBlockGap({
                prevLeftX,
                prevRightX,
                prevHeight,
                nextLeftX,
                nextRightX,
                nextHeight,
            }, i);

            // Extend the bottom of a block beneath the next block when they
            // touch; sharing the exact same edge would let the background
            // bleed through the antialiasing along the seam
            const isCovered = i < this.blocks.length - 1 && gap === 0;
            const nextCurveScale = isCovered ? 4 : 2;

            // A quadratic curve dips halfway to its control point
            const dimensions = {
                centerX,
                ...edges,
                prevCurve: 2 * this.getCurveDepth(edges.prevRightX - edges.prevLeftX),
                nextCurve: nextCurveScale * this.getCurveDepth(edges.nextRightX - edges.nextLeftX),
                ratio: block.ratio,
            };

            paths.push(makeBlockPaths(dimensions, false));

            if (barOverlay.enabled) {
                overlayPaths.push(makeBlockPaths(dimensions, true));
            }

            // Set the next block's previous position
            prevLeftX = nextLeftX;
            prevRightX = nextRightX;
            prevHeight = nextHeight;
        });

        return [paths, overlayPaths];
    }

    /**
     * Shrink a block's edges to leave room for the gap between it and its
     * neighbors. Each gap is split evenly between the two blocks it separates,
     * and the corners slide along the block's own sides so that the overall
     * funnel shape is preserved.
     *
     * @param {Object} edges
     * @param {int}    index
     *
     * @return {Object}
     */
    carveBlockGap(edges, index) {
        const {
            prevLeftX,
            prevRightX,
            prevHeight,
            nextLeftX,
            nextRightX,
            nextHeight,
        } = edges;
        const { gap } = this.options.block;
        const height = nextHeight - prevHeight;

        let trimTop = index > 0 ? gap / 2 : 0;
        let trimBottom = index < this.blocks.length - 1 ? gap / 2 : 0;

        if (height <= 0 || trimTop + trimBottom === 0) {
            return edges;
        }

        // Never trim a block past zero height
        const scale = Math.min(1, height / (trimTop + trimBottom));
        trimTop *= scale;
        trimBottom *= scale;

        const top = trimTop / height;
        const bottom = 1 - (trimBottom / height);
        const lerp = (a, b, t) => a + ((b - a) * t);

        return {
            prevLeftX: lerp(prevLeftX, nextLeftX, top),
            prevRightX: lerp(prevRightX, nextRightX, top),
            prevHeight: prevHeight + trimTop,
            nextLeftX: lerp(prevLeftX, nextLeftX, bottom),
            nextRightX: lerp(prevRightX, nextRightX, bottom),
            nextHeight: nextHeight - trimBottom,
        };
    }

    /**
     * @param {Number} neckLeftX
     *
     * @return {Number}
     */
    getDx(neckLeftX) {
        // Only unpinched blocks narrow, so a pinch makes them sharper
        return neckLeftX / (this.blocks.length - this.options.chart.pinchedBlocks);
    }

    /**
     * @return {Number}
     */
    getDy() {
        // Curved chart needs reserved pixels to account for curvature
        if (this.options.chart.curve.enabled) {
            return (this.height - this.getCurveReserve()) / this.blocks.length;
        }

        return this.height / this.blocks.length;
    }

    /**
     * Returns how far the curve of a horizontal edge of the given width dips
     * below (or, for the back of an oval, rises above) its endpoints.
     *
     * Each edge is drawn as part of an ellipse viewed from a fixed angle, so
     * its depth is proportional to its width. An edge spanning the full width
     * of the chart has a depth of a quarter of `curve.depth`.
     *
     * @param {Number} width
     *
     * @return {Number}
     */
    getCurveDepth(width) {
        return (this.options.chart.curve.depth / 4) * (Math.max(width, 0) / this.width);
    }

    /**
     * @return {Number}
     */
    getTopEdgeWidth() {
        return this.options.chart.inverted ? this.neckWidth : this.width;
    }

    /**
     * @return {Number}
     */
    getBottomEdgeWidth() {
        return this.options.chart.inverted ? this.width : this.neckWidth;
    }

    /**
     * Returns the vertical space needed above and below the blocks of a curved
     * funnel for the back of the top oval and the dip of the bottom edge.
     *
     * @return {Number}
     */
    getCurveReserve() {
        return this.getCurveDepth(this.getTopEdgeWidth()) +
            this.getCurveDepth(this.getBottomEdgeWidth());
    }

    /**
     * Define the linear color gradients.
     *
     * @param {Object} svg
     *
     * @return {void}
     */
    defineColorGradients(svg) {
        const { fill, highlight } = this.options.block;
        const defs = svg.append('defs');

        // Create a gradient for each block
        this.blocks.forEach((block, index) => {
            const color = block.fill.raw;
            const shadedEdge = this.colorizer.shade(color, fill.gradientShade);

            this.defineColorGradient(defs, this.colorizer.getGradientId(index), color, shadedEdge);

            // Highlighting shades every stop of the gradient, rather than
            // replacing it with a solid color
            if (highlight.enabled) {
                this.defineColorGradient(
                    defs,
                    this.colorizer.getGradientId(index, true),
                    this.colorizer.shade(color, highlight.shade),
                    this.colorizer.shade(shadedEdge, highlight.shade),
                );
            }
        });
    }

    /**
     * Define a linear gradient that runs from its shaded edge color to its
     * center color and back.
     *
     * @param {Object} defs
     * @param {string} id
     * @param {string} color
     * @param {string} shadedEdge
     *
     * @return {void}
     */
    defineColorGradient(defs, id, color, shadedEdge) {
        const gradient = defs.append('linearGradient')
            .attr('id', id);

        // Define the gradient stops
        const stops = [
            [0, shadedEdge],
            [40, color],
            [60, color],
            [100, shadedEdge],
        ];

        // Add the gradient stops
        stops.forEach((stop) => {
            gradient.append('stop')
                .attr('offset', `${stop[0]}%`)
                .attr('style', `stop-color: ${stop[1]}`);
        });
    }

    /**
     * Draw the top oval of a curved funnel block.
     *
     * @param {Object} svg
     * @param {int}    index
     *
     * @return {void}
     */
    drawTopOval(svg, index) {
        const { shade } = this.options.chart.curve;
        const centerX = this.width / 2;

        // Create path from the top of the block, mirroring the block's top
        // curve to form the back of the oval; the front extends beneath the
        // block to avoid a seam along their shared edge
        const [
            [, leftX, topY],
            [, , controlY],
            [, rightX],
        ] = this.blockPaths[index];
        const curve = controlY - topY;

        const path = this.navigator.plot([
            ['M', leftX, topY],
            ['Q', centerX, topY + (2 * curve)],
            ['', rightX, topY],
            ['M', rightX, topY],
            ['Q', centerX, topY - curve],
            ['', leftX, topY],
        ]);

        // Draw top oval beneath any other element, so that the block above
        // it (if any) overlaps its back edge
        svg.insert('path', ':first-child')
            .attr('fill', this.colorizer.shade(this.blocks[index].fill.raw, shade))
            .attr('d', path);
    }

    /**
     * Draw the block at the given index. When animated, the next block is
     * drawn once this one finishes.
     *
     * @param {int} index
     *
     * @return {void}
     */
    drawBlock(index) {
        const { chart, events, tooltip } = this.options;
        const { gap, barOverlay, highlight } = this.options.block;

        // Separated blocks of a curved funnel each show their own top
        if (chart.curve.enabled && gap > 0 && index > 0) {
            this.drawTopOval(this.svg, index);
        }

        // Create a group just for this block
        const group = this.svg.append('g');
        const block = this.blocks[index];

        this.blockGroups[index] = group;

        // Fetch path element
        const path = this.appendPath(group, index, false);

        // Attach data to the element
        this.attachData(path, block);

        let pathColor = block.fill.actual;

        if (barOverlay.enabled) {
            const overlayPath = this.appendPath(group, index, true);
            this.attachData(overlayPath, block);

            // Add data attribute to distinguish between paths
            path.attr('data-path-type', 'background');
            overlayPath.attr('data-path-type', 'foreground');

            // Default path becomes an outlined background of lighter shade
            pathColor = this.getBackgroundFill(block);
            path.attr('stroke', block.fill.raw);

            this.animate(overlayPath)
                .attr('fill', block.fill.actual)
                .attr('d', this.getPathDefinition(index, true));
        }

        const pathDrawing = this.animate(path)
            .attr('fill', pathColor)
            .attr('d', this.getPathDefinition(index, false));

        if (chart.animation.duration !== 0 && index < this.blocks.length - 1) {
            pathDrawing.on('end', () => {
                this.drawBlock(index + 1);
            });
        }

        // The block's path and any overlay share the same events
        const paths = group.selectAll('path');

        // Add the hover events
        if (highlight.enabled) {
            paths
                .on('mouseover', this.onMouseOver)
                .on('mouseout', this.onMouseOut);
        }

        // Add block click event
        if (events.click.block !== null) {
            paths.style('cursor', 'pointer')
                .on('click', events.click.block);
        }

        // Add block hover events; namespaced so they do not replace the highlight handlers
        if (events.mouseover.block !== null) {
            paths.on('mouseover.block', events.mouseover.block);
        }
        if (events.mouseout.block !== null) {
            paths.on('mouseout.block', events.mouseout.block);
        }

        // Add tooltips
        if (tooltip.enabled) {
            paths
                .on('mousemove.tooltip', (event) => {
                    this.tooltip.show(event, block.tooltip.formatted, block.fill.raw);
                })
                .on('mouseout.tooltip', () => this.tooltip.hide());
        }

        this.drawLabel(index);
    }

    /**
     * Return a transition of the given selection when the chart is animated,
     * or the selection itself otherwise, so that attributes set on the result
     * apply either way.
     *
     * @param {Object} selection
     *
     * @return {Object}
     */
    animate(selection) {
        const { duration } = this.options.chart.animation;

        if (duration === 0) {
            return selection;
        }

        return selection.transition()
            .duration(duration)
            .ease(easeLinear);
    }

    /**
     * Append a block or overlay path element to the given group.
     *
     * @param {Object}  group
     * @param {int}     index
     * @param {boolean} isOverlay
     *
     * @return {Object}
     */
    appendPath(group, index, isOverlay) {
        const path = group.append('path');

        if (this.options.chart.animation.duration !== 0) {
            this.addBeforeTransition(path, index, isOverlay);
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

        let beforePath;
        let beforeFill;

        // Construct the top of the trapezoid and leave the other elements
        // hovering around to expand downward on animation
        if (!this.options.chart.curve.enabled) {
            const [
                [, leftX, leftY],
                [, rightX, rightY],
            ] = paths;

            beforePath = this.navigator.plot([
                ['M', leftX, leftY],
                ['L', rightX, rightY],
                ['L', rightX, rightY],
                ['L', leftX, leftY],
            ]);
        } else {
            const [
                [, leftX, leftY],
                [, controlX, controlY],
                [, rightX, rightY],
            ] = paths;

            beforePath = this.navigator.plot([
                ['M', leftX, leftY],
                ['Q', controlX, controlY],
                ['', rightX, rightY],
                ['L', rightX, rightY],
                ['M', rightX, rightY],
                ['Q', controlX, controlY],
                ['', leftX, leftY],
            ]);
        }

        if (this.options.block.fill.type === 'solid' && index > 0) {
            // Use previous fill color, if available
            beforeFill = this.blocks[index - 1].fill.actual;
        } else {
            // Otherwise use current background
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
     * @param {int}     index
     * @param {boolean} isOverlay
     *
     * @return {string}
     */
    getPathDefinition(index, isOverlay) {
        return this.navigator.plot(isOverlay ? this.overlayPaths[index] : this.blockPaths[index]);
    }

    /**
     * @param {Object} event
     * @param {Object} data
     *
     * @return {void}
     */
    onMouseOver(event, data) {
        // Highlight all paths within one block, shading each from its own
        // resting color so that every path changes by the same amount
        this.blockGroups[data.index].selectAll('path').nodes().forEach((node) => {
            const isBackground = node.dataset.pathType === 'background';

            select(node).attr('fill', this.getHighlightFill(data, isBackground));
        });
    }

    /**
     * @param {Object} event
     * @param {Object} data
     *
     * @return {void}
     */
    onMouseOut(event, data) {
        // Restore original color for all paths of a block
        this.blockGroups[data.index].selectAll('path').nodes().forEach((node) => {
            const isBackground = node.dataset.pathType === 'background';

            select(node).attr('fill', isBackground ? this.getBackgroundFill(data) : data.fill.actual);
        });
    }

    /**
     * Return the lighter fill of a block's path when an overlay is drawn on
     * top of it.
     *
     * @param {Object} block
     *
     * @return {string}
     */
    getBackgroundFill(block) {
        return this.colorizer.shade(block.fill.raw, this.options.block.barOverlay.shade);
    }

    /**
     * Return the fill of a block's path while the block is highlighted.
     *
     * @param {Object}  block
     * @param {boolean} isBackground Whether the path is the background behind an overlay.
     *
     * @return {string}
     */
    getHighlightFill(block, isBackground) {
        const { shade } = this.options.block.highlight;

        if (isBackground) {
            return this.colorizer.shade(this.getBackgroundFill(block), shade);
        }

        if (this.options.block.fill.type === 'gradient') {
            return this.colorizer.getGradientFill(block.index, true);
        }

        return this.colorizer.shade(block.fill.raw, shade);
    }

    /**
     * Draw the label of the given block, replacing any label already drawn
     * there. The overrides apply only to this drawing, so calling this again
     * without them restores the block's original label.
     *
     * @param {int}    index
     * @param {Object} overrides Any of `color`, `fontSize`, and `fontFamily`.
     *
     * @return {void}
     */
    drawLabel(index, overrides = {}) {
        const group = this.blockGroups[index];
        const label = { ...this.blocks[index].label, ...overrides };
        const labelOptions = this.options.label;

        // Blocks not yet drawn, such as during the load animation, will draw
        // their own label once they appear
        if (!group) {
            return;
        }

        // Remove any existing label
        group.select('text').remove();

        if (!labelOptions.enabled || !label.enabled) {
            return;
        }

        const lines = label.formatted.split('\n');

        // Center the text horizontally
        const x = this.width / 2;

        const text = group.append('text')
            .attr('x', x)
            .attr('fill', label.color)
            .attr('font-size', label.fontSize)
            .attr('font-family', label.fontFamily)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('pointer-events', 'none');

        // Lines are spaced by the rendered font size, which is only known once
        // the text exists; fall back to the configured size if the chart is not
        // attached to the document
        const fontSize = parseFloat(window.getComputedStyle(text.node()).fontSize) ||
            parseFloat(label.fontSize);
        const lineHeight = fontSize * labelOptions.lineHeight;

        // Position the text at the vertical center of all its lines
        const y = this.getTextY(index, lines.length, lineHeight);
        const firstLineY = y - ((lineHeight * (lines.length - 1)) / 2);

        text.attr('y', y);

        lines.forEach((line, i) => {
            // Each line is offset from the one before it
            const tspan = text.append('tspan')
                .attr('x', x)
                .attr('dy', i === 0 ? firstLineY - y : lineHeight)
                .text(line);

            if (labelOptions.overflow === 'ellipsis') {
                const lineY = firstLineY + (lineHeight * i);

                // The block is narrowest at either the top or bottom of the line
                const maxWidth = Math.min(
                    this.getBlockWidthAt(index, lineY - (lineHeight / 2)),
                    this.getBlockWidthAt(index, lineY + (lineHeight / 2)),
                ) - (2 * labelOptions.padding);

                this.truncateText(tspan.node(), maxWidth);
            }
        });
    }

    /**
     * Shorten the text of the given element with an ellipsis until it is no
     * wider than the given width.
     *
     * @param {SVGTextContentElement} node
     * @param {Number}                maxWidth
     *
     * @return {void}
     */
    /* eslint-disable no-param-reassign */
    truncateText(node, maxWidth) {
        if (node.getComputedTextLength() <= maxWidth) {
            return;
        }

        // Split by code point to avoid breaking apart surrogate pairs
        const chars = Array.from(node.textContent);
        const truncate = (length) => `${chars.slice(0, length).join('').trimEnd()}\u2026`;

        // Binary search for the longest prefix that fits
        let low = 0;
        let high = chars.length - 1;

        while (low < high) {
            const mid = Math.ceil((low + high) / 2);

            node.textContent = truncate(mid);

            if (node.getComputedTextLength() <= maxWidth) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }

        node.textContent = truncate(low);

        // Hide the text entirely if not even the ellipsis fits
        if (node.getComputedTextLength() > maxWidth) {
            node.textContent = '';
        }
    }
    /* eslint-enable no-param-reassign */

    /**
     * Returns the width of the given block at the given y position, which is
     * clamped to the block's top and bottom.
     *
     * @param {int}    index
     * @param {Number} y
     *
     * @return {Number}
     */
    getBlockWidthAt(index, y) {
        const paths = this.blockPaths[index];

        // Straight blocks are a simple trapezoid; curved blocks have their
        // side corners at different path points
        const [
            [, topLeftX, topY],
            [, topRightX],
            [, bottomRightX],
            [, bottomLeftX, bottomY],
        ] = this.options.chart.curve.enabled ?
            [paths[0], paths[2], paths[3], paths[6]] :
            [paths[0], paths[1], paths[2], paths[3]];

        const height = bottomY - topY;
        const t = height > 0 ? Math.min(Math.max((y - topY) / height, 0), 1) : 0;

        const left = topLeftX + ((bottomLeftX - topLeftX) * t);
        const right = topRightX + ((bottomRightX - topRightX) * t);

        return right - left;
    }

    /**
     * Returns the y position of the vertical center of the given label's text,
     * according to the `label.verticalAlign` setting.
     *
     * @param {int}    index
     * @param {Number} lineCount
     * @param {Number} lineHeight
     *
     * @return {Number}
     */
    getTextY(index, lineCount, lineHeight) {
        const { chart, label } = this.options;
        const paths = this.blockPaths[index];
        const offset = label.padding + ((lineHeight * lineCount) / 2);

        // The top and bottom edges of the block at its horizontal center; each
        // path command is [command, x, y]
        let top = paths[0][2];
        let bottom = paths[2][2];
        let middle = (top + bottom) / 2;

        if (chart.curve.enabled) {
            const nextPaths = this.blockPaths[index + 1];

            // A quadratic curve peaks halfway between its endpoints and its
            // control point; the bottom of a block may be hidden behind the
            // top of the next block, if one exists
            top = (paths[0][2] + paths[1][2]) / 2;
            bottom = (paths[3][2] + paths[5][2]) / 2;

            if (nextPaths) {
                bottom = Math.min(bottom, (nextPaths[0][2] + nextPaths[1][2]) / 2);
            }

            middle = (top + bottom) / 2;
        }

        if (label.verticalAlign === 'top') {
            return top + offset;
        }

        if (label.verticalAlign === 'bottom') {
            return bottom - offset;
        }

        return middle;
    }
}

export default D3Funnel;
