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
import Utils from '#js/Utils.js';

class D3Funnel {
    static defaults = {
        chart: {
            width: 350,
            height: 400,
            bottomWidth: 1 / 3,
            bottomPinch: 0,
            inverted: false,
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
            barOverlay: {
                enabled: false,
                shade: 0.3,
            },
            fill: {
                scale: scaleOrdinal(schemeCategory10).domain(range(0, 10)),
                type: 'solid',
                gradientShade: -0.2,
            },
            minHeight: 0,
            gap: 0,
            highlight: {
                enabled: false,
                shade: -0.2,
                overlayShade: -0.5,
            },
        },
        label: {
            enabled: true,
            fontFamily: null,
            fontSize: '14px',
            lineHeight: 1.4,
            fill: '#fff',
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
        // Remove everything from the container, including any tooltip; event
        // listeners go along with the elements they are attached to
        this.container.replaceChildren();
        this.tooltip = null;
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
            barOverlay: settings.block.barOverlay,
            animation: settings.chart.animate,
            totalCount: settings.chart.totalCount,
            fillType: settings.block.fill.type,
            gradientShade: settings.block.fill.gradientShade,
            highlight: settings.block.highlight,
            dynamicHeight: settings.block.dynamicHeight,
            dynamicSlope: settings.block.dynamicSlope,
            minHeight: settings.block.minHeight,
            blockGap: settings.block.gap,
            label: settings.label,
            tooltip: settings.tooltip,
            onBlockClick: settings.events.click.block,
            onBlockMouseOver: settings.events.mouseover.block,
            onBlockMouseOut: settings.events.mouseout.block,
        };

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
     * @param {Object} options
     *
     * @return {Object}
     */
    getSettings(options) {
        const containerDimensions = this.getContainerDimensions();
        const defaults = this.getDefaultSettings(containerDimensions);

        // Override default settings with user options
        const settings = Utils.extend(defaults, options);

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
     * Return the total count of all blocks.
     *
     * @param {Array} blocks
     *
     * @return {Number}
     */
    getTotalCount(blocks) {
        if (this.settings.totalCount !== null) {
            return this.settings.totalCount || 0;
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
        const totalCount = this.getTotalCount(data);

        return data.map((block, index) => {
            const ratio = totalCount > 0 ? (block.value / totalCount || 0) : 1 / data.length;

            return {
                index,
                data: block,
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
                    fontSize: block.labelFontSize ?? this.settings.label.fontSize,
                    fontFamily: block.labelFontFamily ?? this.settings.label.fontFamily,
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

        // The <g> element of each block, filled in as the blocks are drawn
        this.blockGroups = [];

        // Define color gradients
        if (this.settings.fillType === 'gradient') {
            this.defineColorGradients(this.svg);
        }

        // Add top oval if curved
        if (this.settings.isCurved) {
            this.drawTopOval(this.svg, 0);
        }

        // Add each block; animated blocks draw each other in turn, once the
        // block before them finishes
        if (this.settings.animation !== 0) {
            this.drawBlock(0);
        } else {
            this.blocks.forEach((block, index) => this.drawBlock(index));
        }
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

        const paths = [];
        const overlayPaths = [];

        // The change in x, y direction of each block, unless adjusted below
        const initialDx = this.getDx(bottomLeftX);
        const initialDy = this.getDy();

        // Start from the bottom for inverted
        let prevLeftX = this.settings.isInverted ? bottomLeftX : 0;
        let prevRightX = this.settings.width - prevLeftX;

        // Move down to make room for the back of the top oval
        let prevHeight = this.settings.isCurved ? this.getCurveDepth(this.getTopEdgeWidth()) : 0;

        // This is greedy in that the block will have a guaranteed height
        // and the remaining is shared among the ratio, instead of being
        // shared according to the remaining minus the guaranteed
        const totalHeight = this.settings.height - (this.settings.minHeight * this.blocks.length);

        // The top and bottom edges of the funnel's sides
        const topY = prevHeight;
        const bottomY = this.settings.isCurved ?
            this.settings.height - this.getCurveDepth(this.getBottomEdgeWidth()) :
            this.settings.height;

        // Get the dynamic height of a block
        const getBlockHeight = (block) => {
            // Slice off the height proportional to this block and add the
            // greedy minimum height
            let height = (totalHeight * block.ratio) + this.settings.minHeight;

            // Account for any curvature
            if (this.settings.isCurved) {
                height -= this.getCurveReserve() / this.blocks.length;
            }

            return height;
        };

        // Pinched blocks sit at the narrow end of the funnel and keep its width
        const isPinched = (i) => (
            this.settings.isInverted ?
                i < this.settings.bottomPinch :
                i >= this.blocks.length - this.settings.bottomPinch
        );

        // Correct slope height if there are blocks being pinched (and thus
        // requiring a sharper curve)
        const pinchHeight = this.blocks
            .filter((block, i) => isPinched(i))
            .reduce((total, block) => total + getBlockHeight(block), 0);

        const makeBlockPaths = this.settings.isCurved ?
            (dimensions, isOverlay) => this.navigator.makeCurvedPaths(dimensions, isOverlay) :
            (dimensions, isOverlay) => this.navigator.makeStraightPaths(dimensions, isOverlay);

        // The slope will determine the x points on each block iteration
        // Given: slope = (y1 - y2) / (x1 - x2)
        // (x1, y1) = (bottomLeftX, the start of any pinch)
        // (x2, y2) = (0, the far edge of the funnel)
        const slope = (bottomY - topY - pinchHeight) / bottomLeftX;

        // Create the path definition for each funnel block
        // Remember to loop back to the beginning point for a closed path
        this.blocks.forEach((block, i) => {
            let dx = initialDx;
            let dy = initialDy;

            // Make heights proportional to block weight
            if (this.settings.dynamicHeight) {
                dy = getBlockHeight(block);

                // Given: y = mx + b
                // Given: b = topY (when funnel), b = bottomY (when pyramid)
                // For funnel, x_i = (y_i - topY) / slope
                let targetLeftX = ((prevHeight + dy) - topY) / slope;

                // For pyramid, x_i = (y_i - bottomY) / -slope
                if (this.settings.isInverted) {
                    targetLeftX = ((prevHeight + dy) - bottomY) / (-1 * slope);
                }

                // If bottomWidth is 0, adjust last x position (to circumvent
                // errors associated with rounding)
                if (this.settings.bottomWidth === 0 && i === this.blocks.length - 1) {
                    // For funnel, last position is the center
                    targetLeftX = this.settings.width / 2;

                    // For pyramid, last position is the origin
                    if (this.settings.isInverted) {
                        targetLeftX = 0;
                    }
                }

                // If bottomWidth is same as width, stop x velocity
                if (this.settings.bottomWidth === this.settings.width) {
                    targetLeftX = prevLeftX;
                }

                // Prevent NaN or Infinite values (caused by zero heights)
                if (!Number.isFinite(targetLeftX)) {
                    targetLeftX = 0;
                }

                // Calculate the shift necessary for both x points
                dx = targetLeftX - prevLeftX;

                if (this.settings.isInverted) {
                    dx = prevLeftX - targetLeftX;
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
            if (isPinched(i)) {
                dx = 0;
            }

            // Calculate the position of next block, expanding outward if
            // inverted
            const nextLeftX = this.settings.isInverted ? prevLeftX - dx : prevLeftX + dx;
            const nextRightX = this.settings.isInverted ? prevRightX + dx : prevRightX - dx;
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
            const isCovered = i < this.blocks.length - 1 && this.settings.blockGap === 0;
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

            if (this.settings.barOverlay.enabled) {
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
        const height = nextHeight - prevHeight;

        let trimTop = index > 0 ? this.settings.blockGap / 2 : 0;
        let trimBottom = index < this.blocks.length - 1 ? this.settings.blockGap / 2 : 0;

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
     * @param {Number} bottomLeftX
     *
     * @return {Number}
     */
    getDx(bottomLeftX) {
        // Only unpinched blocks narrow, so a pinch makes them sharper
        return bottomLeftX / (this.blocks.length - this.settings.bottomPinch);
    }

    /**
     * @return {Number}
     */
    getDy() {
        // Curved chart needs reserved pixels to account for curvature
        if (this.settings.isCurved) {
            return (this.settings.height - this.getCurveReserve()) / this.blocks.length;
        }

        return this.settings.height / this.blocks.length;
    }

    /**
     * Returns how far the curve of a horizontal edge of the given width dips
     * below (or, for the back of an oval, rises above) its endpoints.
     *
     * Each edge is drawn as part of an ellipse viewed from a fixed angle, so
     * its depth is proportional to its width. An edge spanning the full width
     * of the chart has a depth of a quarter of the curve height.
     *
     * @param {Number} width
     *
     * @return {Number}
     */
    getCurveDepth(width) {
        return (this.settings.curveHeight / 4) * (Math.max(width, 0) / this.settings.width);
    }

    /**
     * @return {Number}
     */
    getTopEdgeWidth() {
        return this.settings.isInverted ? this.settings.bottomWidth : this.settings.width;
    }

    /**
     * @return {Number}
     */
    getBottomEdgeWidth() {
        return this.settings.isInverted ? this.settings.width : this.settings.bottomWidth;
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
        const defs = svg.append('defs');

        // Create a gradient for each block
        this.blocks.forEach((block, index) => {
            const color = block.fill.raw;
            const shade = this.colorizer.shade(color, this.settings.gradientShade);

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
     * Draw the top oval of a curved funnel block.
     *
     * @param {Object} svg
     * @param {int}    index
     *
     * @return {void}
     */
    drawTopOval(svg, index) {
        const centerX = this.settings.width / 2;

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
            .attr('fill', this.colorizer.shade(this.blocks[index].fill.raw, this.settings.curveShade))
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
        // Separated blocks of a curved funnel each show their own top
        if (this.settings.isCurved && this.settings.blockGap > 0 && index > 0) {
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

        if (this.settings.barOverlay.enabled) {
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

        if (this.settings.animation !== 0 && index < this.blocks.length - 1) {
            pathDrawing.on('end', () => {
                this.drawBlock(index + 1);
            });
        }

        // The block's path and any overlay share the same events
        const paths = group.selectAll('path');

        // Add the hover events
        if (this.settings.highlight.enabled) {
            paths
                .on('mouseover', this.onMouseOver)
                .on('mouseout', this.onMouseOut);
        }

        // Add block click event
        if (this.settings.onBlockClick !== null) {
            paths.style('cursor', 'pointer')
                .on('click', this.settings.onBlockClick);
        }

        // Add block hover events; namespaced so they do not replace the highlight handlers
        if (this.settings.onBlockMouseOver !== null) {
            paths.on('mouseover.block', this.settings.onBlockMouseOver);
        }
        if (this.settings.onBlockMouseOut !== null) {
            paths.on('mouseout.block', this.settings.onBlockMouseOut);
        }

        // Add tooltips
        if (this.settings.tooltip.enabled) {
            paths
                .on('mousemove.tooltip', (event) => this.showTooltip(event, block))
                .on('mouseout.tooltip', () => this.hideTooltip());
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
        if (this.settings.animation === 0) {
            return selection;
        }

        return selection.transition()
            .duration(this.settings.animation)
            .ease(easeLinear);
    }

    /**
     * Show the tooltip of the given block beside the mouse, creating the
     * tooltip if needed.
     *
     * @param {MouseEvent} event
     * @param {Object}     block
     *
     * @return {void}
     */
    showTooltip(event, block) {
        // Reuse a single tooltip across blocks, so that moving between them
        // only updates it
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.setAttribute('class', 'd3-funnel-tooltip');
            this.container.appendChild(this.tooltip);
        }

        // Style the tooltip before measuring it, as its styles determine its size
        this.tooltip.innerText = block.tooltip.formatted;
        this.tooltip.setAttribute('style', this.getTooltipStyle(block));

        this.positionTooltip(event);
    }

    /**
     * Return the inline style of the tooltip for the given block, placing the
     * tooltip at `left: 0; top: 0` until positioned.
     *
     * @param {Object} block
     *
     * @return {string}
     */
    getTooltipStyle(block) {
        const styles = [
            // Position the tooltip without letting it catch the mouse
            'display: inline-block',
            'position: absolute',
            'left: 0',
            'top: 0',
            'pointer-events: none',

            // Outline the tooltip in the block's color, unless styled otherwise
            `border-color: ${block.fill.raw}`,

            // Apply the configured styles, skipping any removed with `null`
            ...Object.entries(this.settings.tooltip.style)
                .filter(([, value]) => value !== null)
                .map(([property, value]) => `${property}: ${value}`),
        ];

        return styles.join(';');
    }

    /**
     * Center the tooltip above the mouse, or below it if there is no room
     * above the chart.
     *
     * @param {MouseEvent} event
     *
     * @return {void}
     */
    positionTooltip(event) {
        const { offset } = this.settings.tooltip;
        const containerTop = this.container.getBoundingClientRect().top;

        // While at `left: 0; top: 0`, the tooltip sits at the origin of
        // whichever element it is positioned relative to, such as a positioned
        // ancestor or the page itself
        const origin = this.tooltip.getBoundingClientRect();

        // The desired top-left corner of the tooltip, relative to the viewport
        const fitsAbove = event.clientY - origin.height - offset >= containerTop;
        const x = event.clientX - (origin.width / 2);
        const y = fitsAbove ? event.clientY - origin.height - offset : event.clientY + offset;

        this.tooltip.style.left = `${x - origin.left}px`;
        this.tooltip.style.top = `${y - origin.top}px`;
    }

    /**
     * Hide the tooltip, if shown.
     *
     * @return {void}
     */
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
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

        if (this.settings.animation !== 0) {
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
        if (!this.settings.isCurved) {
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

        if (this.settings.fillType === 'solid' && index > 0) {
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
        const { shade, overlayShade } = this.settings.highlight;

        // Highlight all paths within one block, shading any overlay separately
        this.blockGroups[data.index].selectAll('path').nodes().forEach((node) => {
            const isOverlay = node.dataset.pathType === 'foreground';

            select(node).attr('fill', this.colorizer.shade(data.fill.raw, isOverlay ? overlayShade : shade));
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
        return this.colorizer.shade(block.fill.raw, this.settings.barOverlay.shade);
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

        // Blocks not yet drawn, such as during the load animation, will draw
        // their own label once they appear
        if (!group) {
            return;
        }

        // Remove any existing label
        group.select('text').remove();

        if (!this.settings.label.enabled || !label.enabled) {
            return;
        }

        const lines = label.formatted.split('\n');

        // Center the text horizontally
        const x = this.settings.width / 2;

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
        const lineHeight = fontSize * this.settings.label.lineHeight;

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

            if (this.settings.label.overflow === 'ellipsis') {
                const lineY = firstLineY + (lineHeight * i);

                // The block is narrowest at either the top or bottom of the line
                const maxWidth = Math.min(
                    this.getBlockWidthAt(index, lineY - (lineHeight / 2)),
                    this.getBlockWidthAt(index, lineY + (lineHeight / 2)),
                ) - (2 * this.settings.label.padding);

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
        ] = this.settings.isCurved ?
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
        const { isCurved, label } = this.settings;
        const paths = this.blockPaths[index];
        const offset = this.settings.label.padding + ((lineHeight * lineCount) / 2);

        // The top and bottom edges of the block at its horizontal center; each
        // path command is [command, x, y]
        let top = paths[0][2];
        let bottom = paths[2][2];
        let middle = (top + bottom) / 2;

        if (isCurved) {
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
