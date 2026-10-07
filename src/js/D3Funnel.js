import { easeLinear } from 'd3-ease';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { select } from 'd3-selection';
import 'd3-transition';
import { nanoid } from 'nanoid';

import Colorizer from '#js/Colorizer.js';
import LabelFormatter from '#js/LabelFormatter.js';
import Labeler from '#js/Labeler.js';
import Navigator from '#js/Navigator.js';
import Projection from '#js/Projection.js';
import Tooltip from '#js/Tooltip.js';
import Utils from '#js/Utils.js';

class D3Funnel {
    static defaults = {
        chart: {
            width: 350,
            height: 400,
            direction: 'down',
            neckRatio: 1 / 3,
            pinchedBlocks: 0,
            animation: {
                duration: 0,
            },
            curve: {
                enabled: false,
                depth: 5,
                shade: -0.4,
            },
            totalValue: null,
        },
        block: {
            proportionalLength: false,
            proportionalBreadth: false,
            barOverlay: {
                enabled: false,
                shade: 0.3,
            },
            fill: {
                colors: schemeCategory10,
                type: 'solid',
                gradientShade: -0.2,
            },
            minLength: 0,
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
                padding: '5px 15px',
                'text-align': 'center',
            },
        },
        accessibility: {
            chartName: null,
            blockFormat: '{l}: {f}',
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
        // Remove everything from the container, including any tooltip. Event listeners go along
        // with the elements they are attached to
        this.container.replaceChildren();
    }

    /**
     * Draw the chart inside the container with the data and configuration specified. This will
     * remove any previous SVG elements in the container and draw a new funnel chart on top of it.
     *
     * @param {Array}  data    A list of rows containing a category, a count, and optionally a
     *                         color (in hex).
     * @param {Object} options An optional configuration object to override defaults. See the docs.
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

        // Lay the funnel out in flow space, then project it onto the screen
        this.projection = new Projection(width, height, this.options.chart.direction);
        this.length = this.projection.length;
        this.breadth = this.projection.breadth;
        this.neckBreadth = this.breadth * this.options.chart.neckRatio;

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
        // Set the default width and height based on the container, leaving the static defaults
        // untouched for future charts
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
     * Convert the raw data into a standardized format and pre-calculate some values.
     *
     * @param {Array} data
     *
     * @return {Array}
     */
    standardizeData(data) {
        const { label, tooltip, accessibility } = this.options;
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
                    formatted: LabelFormatter.format(block, label.format),
                    color: this.colorizer.getLabelColor(block.labelColor),
                    fontSize: block.labelFontSize ?? label.fontSize,
                    fontFamily: block.labelFontFamily ?? label.fontFamily,
                },
                tooltip: {
                    formatted: LabelFormatter.format(block, tooltip.format),
                },
                accessibility: {
                    formatted: LabelFormatter.format(block, accessibility.blockFormat),
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
        const { chart, block, accessibility } = this.options;

        // Add the SVG. Screen readers announce it as a list with an item for each block
        this.svg = select(this.container)
            .append('svg')
            .attr('id', this.id)
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('role', 'list')
            .attr('aria-label', accessibility.chartName);

        this.blockShapes = this.makeBlockShapes();
        [this.blockPaths, this.overlayPaths] = this.makePaths();

        // The <g> element of each block, filled in as the blocks are drawn
        this.blockGroups = [];

        // A fresh tooltip for each drawing, as the previous one is removed along with the rest of
        // the chart
        this.tooltip = new Tooltip(this.container, this.options.tooltip);
        this.labeler = new Labeler(this.options.label);

        // Define color gradients
        if (block.fill.type === 'gradient') {
            this.defineColorGradients(this.svg);
        }

        // Add each block. Animated blocks draw each other in turn, once the block before them
        // finishes
        if (chart.animation.duration !== 0) {
            this.drawBlock(0);
        } else {
            this.blocks.forEach((data, index) => this.drawBlock(index));
        }
    }

    /**
     * Create the paths of each block, and of each bar overlay if enabled, from the block shapes.
     *
     * @return {Array, Array}
     */
    makePaths() {
        const makeBlockPaths = this.options.chart.curve.enabled ?
            (shape, overlayRatio) => this.navigator.makeCurvedPaths(shape, overlayRatio) :
            (shape, overlayRatio) => this.navigator.makeStraightPaths(shape, overlayRatio);

        const paths = this.blockShapes.map((shape) => makeBlockPaths(shape));
        const overlayPaths = this.options.block.barOverlay.enabled ?
            this.blockShapes.map((shape, i) => makeBlockPaths(shape, this.blocks[i].ratio)) :
            [];

        return [paths, overlayPaths];
    }

    /**
     * Calculate the shape of each funnel block. Each shape has the following form:
     *
     * {
     *   crossCenter,
     *   start: { crossMin, crossMax, flow, curveDepth },
     *   end: { crossMin, crossMax, flow, curveDepth },
     * }
     *
     * The `start` edge is the one nearer the first block. Each edge runs across the funnel from
     * `crossMin` to `crossMax` at `flow`. Its `curveDepth` is how far the edge bulges along the
     * flow at `crossCenter`, which is zero for a straight funnel. It is positive when the edge
     * bulges toward the end of the funnel and negative when it bulges toward the start.
     *
     * @return {Array}
     */
    makeBlockShapes() {
        const { pinchedBlocks, curve } = this.options.chart;
        const {
            minLength,
            proportionalLength,
            proportionalBreadth,
            gap,
        } = this.options.block;

        // Calculate the important fixed positions
        const neckCrossMin = (this.breadth - this.neckBreadth) / 2;
        const crossCenter = this.breadth / 2;

        const shapes = [];

        // The change in cross and flow position of each block, unless adjusted below
        const initialCrossStep = this.getCrossStep(neckCrossMin);
        const initialFlowStep = this.getFlowStep();

        let prevCrossMin = 0;
        let prevCrossMax = this.breadth;

        // Move along the flow to make room for the back of the start oval
        let prevFlow = curve.enabled ? this.getCurveDepth(this.breadth) : 0;

        // This is greedy in that the block will have a guaranteed length and the remaining is
        // shared among the ratio, instead of being shared according to the remaining minus the
        // guaranteed
        const totalLength = this.length - (minLength * this.blocks.length);

        // The start and end of the funnel's sides
        const sideStartFlow = prevFlow;
        const sideEndFlow = curve.enabled ?
            this.length - this.getCurveDepth(this.neckBreadth) :
            this.length;

        // Get the proportional length of a block
        const getBlockLength = (block) => {
            // Slice off the length proportional to this block and add the greedy minimum length
            let length = (totalLength * block.ratio) + minLength;

            // Account for any curvature
            if (curve.enabled) {
                length -= this.getCurveReserve() / this.blocks.length;
            }

            return length;
        };

        // Pinched blocks sit at the narrow end of the funnel and keep its breadth
        const isPinched = (i) => i >= this.blocks.length - pinchedBlocks;

        // Correct slope length if there are blocks being pinched (and thus requiring a sharper
        // curve)
        const pinchLength = this.blocks
            .filter((block, i) => isPinched(i))
            .reduce((total, block) => total + getBlockLength(block), 0);

        // The depth of an edge's curve is proportional to its breadth, and its direction depends on
        // which way the funnel faces the screen
        const getEdgeCurveDepth = (edge) => (
            curve.enabled ?
                this.projection.curveDirection * this.getCurveDepth(edge.crossMax - edge.crossMin) :
                0
        );

        // The slope will determine the cross positions on each block iteration
        // Given: slope = (flow1 - flow2) / (cross1 - cross2)
        // (cross1, flow1) = (neckCrossMin, the start of any pinch)
        // (cross2, flow2) = (0, the far edge of the funnel)
        const slope = (sideEndFlow - sideStartFlow - pinchLength) / neckCrossMin;

        // Create the shape of each funnel block
        this.blocks.forEach((block, i) => {
            let crossStep = initialCrossStep;
            let flowStep = initialFlowStep;

            // Make lengths proportional to block weight
            if (proportionalLength) {
                flowStep = getBlockLength(block);

                // Given: flow = (slope * cross) + sideStartFlow
                // So: cross_i = (flow_i - sideStartFlow) / slope
                let targetCrossMin = ((prevFlow + flowStep) - sideStartFlow) / slope;

                // If the neck has no breadth, put the last cross position at the center (to
                // circumvent errors associated with rounding)
                if (this.neckBreadth === 0 && i === this.blocks.length - 1) {
                    targetCrossMin = this.breadth / 2;
                }

                // If the neck is as broad as the funnel, stop cross velocity
                if (this.neckBreadth === this.breadth) {
                    targetCrossMin = prevCrossMin;
                }

                // Prevent NaN or Infinite values (caused by zero lengths)
                if (!Number.isFinite(targetCrossMin)) {
                    targetCrossMin = 0;
                }

                // Calculate the shift necessary for both cross positions
                crossStep = targetCrossMin - prevCrossMin;
            }

            // Make breadths proportional to block value
            if (proportionalBreadth) {
                const nextBlockValue = this.blocks[i + 1] ?
                    this.blocks[i + 1].value :
                    block.value;

                const breadthRatio = nextBlockValue / block.value;
                crossStep = (1 - breadthRatio) * (crossCenter - prevCrossMin);
            }

            // Stop velocity for pinched blocks
            if (isPinched(i)) {
                crossStep = 0;
            }

            // Calculate the position of the next block
            const nextCrossMin = prevCrossMin + crossStep;
            const nextCrossMax = prevCrossMax - crossStep;
            const nextFlow = prevFlow + flowStep;

            const { start, end } = this.carveBlockGap({
                start: {
                    crossMin: prevCrossMin,
                    crossMax: prevCrossMax,
                    flow: prevFlow,
                },
                end: {
                    crossMin: nextCrossMin,
                    crossMax: nextCrossMax,
                    flow: nextFlow,
                },
            }, i);

            // Extend the end of a block beneath the next block when they touch, by bulging it one
            // depth further toward the end of the funnel. Sharing the exact same edge would let the
            // background bleed through the antialiasing along the seam
            const isCovered = i < this.blocks.length - 1 && gap === 0;
            const endCurveDepth = getEdgeCurveDepth(end);

            shapes.push({
                crossCenter,
                start: {
                    ...start,
                    curveDepth: getEdgeCurveDepth(start),
                },
                end: {
                    ...end,
                    curveDepth: isCovered ?
                        endCurveDepth + Math.abs(endCurveDepth) :
                        endCurveDepth,
                },
            });

            // Set the next block's previous position
            prevCrossMin = nextCrossMin;
            prevCrossMax = nextCrossMax;
            prevFlow = nextFlow;
        });

        return shapes;
    }

    /**
     * Shrink a block's edges to leave room for the gap between it and its neighbors. Each gap is
     * split evenly between the two blocks it separates, and the corners slide along the block's own
     * sides so that the overall funnel shape is preserved.
     *
     * @param {Object} edges The block's `start` and `end` edges, each with `crossMin`,
     *                       `crossMax`, and `flow`.
     * @param {int}    index
     *
     * @return {Object}
     */
    carveBlockGap(edges, index) {
        const { start, end } = edges;
        const { gap } = this.options.block;
        const length = end.flow - start.flow;

        let trimStart = index > 0 ? gap / 2 : 0;
        let trimEnd = index < this.blocks.length - 1 ? gap / 2 : 0;

        if (length <= 0 || trimStart + trimEnd === 0) {
            return edges;
        }

        // Never trim a block past zero length
        const scale = Math.min(1, length / (trimStart + trimEnd));
        trimStart *= scale;
        trimEnd *= scale;

        // Slide each corner along its side to the edge's new position
        const lerp = (a, b, t) => a + ((b - a) * t);
        const makeEdge = (t, flow) => ({
            crossMin: lerp(start.crossMin, end.crossMin, t),
            crossMax: lerp(start.crossMax, end.crossMax, t),
            flow,
        });

        return {
            start: makeEdge(trimStart / length, start.flow + trimStart),
            end: makeEdge(1 - (trimEnd / length), end.flow - trimEnd),
        };
    }

    /**
     * @param {Number} neckCrossMin
     *
     * @return {Number}
     */
    getCrossStep(neckCrossMin) {
        // Only unpinched blocks narrow, so a pinch makes them sharper
        return neckCrossMin / (this.blocks.length - this.options.chart.pinchedBlocks);
    }

    /**
     * @return {Number}
     */
    getFlowStep() {
        // Curved chart needs reserved pixels to account for curvature
        if (this.options.chart.curve.enabled) {
            return (this.length - this.getCurveReserve()) / this.blocks.length;
        }

        return this.length / this.blocks.length;
    }

    /**
     * Returns how far the curve of an edge of the given breadth bulges along the flow beyond its
     * corners, whichever way it bulges.
     *
     * Each edge is drawn as part of an ellipse viewed from a fixed angle, so its depth is
     * proportional to its breadth. An edge spanning the full breadth of the funnel has a depth of
     * exactly `curve.depth`.
     *
     * @param {Number} breadth
     *
     * @return {Number}
     */
    getCurveDepth(breadth) {
        return this.options.chart.curve.depth * (Math.max(breadth, 0) / this.breadth);
    }

    /**
     * Returns the length needed before and after the blocks of a curved funnel, where the back of
     * its oval or the bulge of its outer edge extends past the blocks' corners.
     *
     * @return {Number}
     */
    getCurveReserve() {
        return this.getCurveDepth(this.breadth) + this.getCurveDepth(this.neckBreadth);
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

            // Highlighting shades every stop of the gradient, rather than replacing it with a solid
            // color
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
     * Define a linear gradient that runs from its shaded edge color to its center color and back.
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

        // Shade across the funnel, which runs down the screen when the funnel is horizontal
        if (this.projection.isHorizontal) {
            gradient.attr('x2', 0).attr('y2', 1);
        }

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
     * Returns whether the given block shows the full oval of a curved funnel. The oval sits at the
     * edge that the funnel's curves bulge away from, which is the start of the first block or the
     * end of the last. When the blocks are separated, each block shows its own oval.
     *
     * @param {int} index
     *
     * @return {boolean}
     */
    hasOval(index) {
        const { chart, block } = this.options;
        const ovalIndex = this.projection.curveDirection > 0 ? 0 : this.blocks.length - 1;

        return chart.curve.enabled && (block.gap > 0 || index === ovalIndex);
    }

    /**
     * Draw the full oval of a curved funnel block.
     *
     * @param {Object} svg
     * @param {int}    index
     *
     * @return {void}
     */
    drawOval(svg, index) {
        const { shade } = this.options.chart.curve;
        const shape = this.blockShapes[index];
        const { crossCenter } = shape;
        const edge = this.projection.curveDirection > 0 ? shape.start : shape.end;

        // Create path from the block's edge, mirroring the edge's curve to form the back of the
        // oval. The front extends beneath the block to avoid a seam along their shared edge. A
        // quadratic curve bulges halfway to its control point
        const curve = 2 * edge.curveDepth;

        const path = this.plot([
            ['M', edge.crossMin, edge.flow],
            ['Q', crossCenter, edge.flow + (2 * curve)],
            ['', edge.crossMax, edge.flow],
            ['M', edge.crossMax, edge.flow],
            ['Q', crossCenter, edge.flow - curve],
            ['', edge.crossMin, edge.flow],
        ]);

        // Draw the oval beneath any other element, so that a neighboring block (if any) overlaps
        // its back edge
        svg.insert('path', ':first-child')
            .attr('fill', this.colorizer.shade(this.blocks[index].fill.raw, shade))
            .attr('d', path)
            .attr('aria-hidden', 'true');
    }

    /**
     * Draw the block at the given index. When animated, the next block is drawn once this one
     * finishes.
     *
     * @param {int} index
     *
     * @return {void}
     */
    drawBlock(index) {
        const { chart, events, tooltip } = this.options;
        const { barOverlay, highlight } = this.options.block;
        const isAnimated = chart.animation.duration !== 0;

        // An animated block grows from its start edge, so an oval on its end edge would float ahead
        // of it. Such an oval waits until the block has finished growing
        const hasOval = this.hasOval(index);
        const isOvalWaiting = hasOval && isAnimated && this.projection.curveDirection < 0;

        if (hasOval && !isOvalWaiting) {
            this.drawOval(this.svg, index);
        }

        const block = this.blocks[index];

        // Create a group just for this block, which screen readers announce as a list item with
        // the block's accessible text
        const group = this.svg.append('g')
            .attr('role', 'listitem')
            .attr('aria-label', block.accessibility.formatted);

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

        if (isAnimated) {
            pathDrawing.on('end', () => {
                if (isOvalWaiting) {
                    this.drawOval(this.svg, index);
                }

                if (index < this.blocks.length - 1) {
                    this.drawBlock(index + 1);
                }
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

        // Add block hover events, namespaced so they do not replace the highlight handlers
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
     * Return a transition of the given selection when the chart is animated, or the selection
     * itself otherwise, so that attributes set on the result apply either way.
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

        // Construct the start edge of the path and leave the other points hovering on it to expand
        // along the flow on animation
        if (!this.options.chart.curve.enabled) {
            const [
                [, minCross, minFlow],
                [, maxCross, maxFlow],
            ] = paths;

            beforePath = this.plot([
                ['M', minCross, minFlow],
                ['L', maxCross, maxFlow],
                ['L', maxCross, maxFlow],
                ['L', minCross, minFlow],
            ]);
        } else {
            const [
                [, minCross, minFlow],
                [, controlCross, controlFlow],
                [, maxCross, maxFlow],
            ] = paths;

            beforePath = this.plot([
                ['M', minCross, minFlow],
                ['Q', controlCross, controlFlow],
                ['', maxCross, maxFlow],
                ['L', maxCross, maxFlow],
                ['M', maxCross, maxFlow],
                ['Q', controlCross, controlFlow],
                ['', minCross, minFlow],
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
     * Attach data to the target element. Also attach the current node to the data object.
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
        return this.plot(isOverlay ? this.overlayPaths[index] : this.blockPaths[index]);
    }

    /**
     * Project the given flow-space path commands onto the screen and compile them into a path
     * description. Every path should be drawn through this method.
     *
     * @param {Array} commands Each as [command, cross, flow].
     *
     * @return {string}
     */
    plot(commands) {
        return this.navigator.plot(this.projection.projectPath(commands));
    }

    /**
     * @param {Object} event
     * @param {Object} data
     *
     * @return {void}
     */
    onMouseOver(event, data) {
        // Highlight all paths within one block, shading each from its own resting color so that
        // every path changes by the same amount
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
     * Return the lighter fill of a block's path when an overlay is drawn on top of it.
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
     * Draw the label of the given block, replacing any label already drawn there. The overrides
     * apply only to this drawing, so calling this again without them restores the block's original
     * label.
     *
     * @param {int}    index
     * @param {Object} overrides Any of `color`, `fontSize`, and `fontFamily`.
     *
     * @return {void}
     */
    drawLabel(index, overrides = {}) {
        const group = this.blockGroups[index];

        // Blocks not yet drawn, such as during the load animation, will draw their own label once
        // they appear
        if (!group) {
            return;
        }

        this.labeler.draw(
            group,
            { ...this.blocks[index].label, ...overrides },
            this.getBlockBounds(index),
        );
    }

    /**
     * Returns the part of the given block that its label can occupy, in screen space.
     *
     * @param {int} index
     *
     * @return {{centerX: Number, top: Number, bottom: Number, getWidthAt: Function}}
     */
    getBlockBounds(index) {
        const shape = this.blockShapes[index];
        const nextShape = this.blockShapes[index + 1];

        // The visible start and end of the block at its cross center, where curved edges bulge the
        // furthest. The end of a block may be hidden behind the start of the next block, if one
        // exists
        const visibleStart = shape.start.flow + shape.start.curveDepth;
        let visibleEnd = shape.end.flow + shape.end.curveDepth;

        if (nextShape) {
            visibleEnd = Math.min(visibleEnd, nextShape.start.flow + nextShape.start.curveDepth);
        }

        return this.projection.projectBounds({
            crossCenter: shape.crossCenter,
            start: visibleStart,
            end: visibleEnd,
            getBreadthAt: (flow) => this.getBlockBreadthAt(index, flow),
            getFlowRangeAt: (cross) => this.getBlockFlowRangeAt(index, cross),
        });
    }

    /**
     * Returns the breadth of the given block at the given flow position, which is clamped to the
     * block's start and end.
     *
     * @param {int}    index
     * @param {Number} flow
     *
     * @return {Number}
     */
    getBlockBreadthAt(index, flow) {
        const { start, end } = this.blockShapes[index];

        const length = end.flow - start.flow;
        const t = length > 0 ? Math.min(Math.max((flow - start.flow) / length, 0), 1) : 0;

        const crossMin = start.crossMin + ((end.crossMin - start.crossMin) * t);
        const crossMax = start.crossMax + ((end.crossMax - start.crossMax) * t);

        return crossMax - crossMin;
    }

    /**
     * Returns the flow positions where the given block is visible at the given cross position, or
     * null if the block does not reach that far across.
     *
     * @param {int}    index
     * @param {Number} cross
     *
     * @return {{start: Number, end: Number}|null}
     */
    getBlockFlowRangeAt(index, cross) {
        const { crossCenter, start, end } = this.blockShapes[index];
        const nextShape = this.blockShapes[index + 1];

        // A curved edge bulges the furthest at the cross center and not at all at its corners
        const getEdgeFlowAt = (edge) => {
            const halfBreadth = (edge.crossMax - edge.crossMin) / 2;
            const offset = halfBreadth > 0 ? (cross - crossCenter) / halfBreadth : 1;

            return edge.flow + (edge.curveDepth * Math.max(1 - (offset ** 2), 0));
        };

        let rangeStart = getEdgeFlowAt(start);
        let rangeEnd = getEdgeFlowAt(end);

        // The end of a block may be hidden behind the start of the next block, if one exists
        if (nextShape) {
            rangeEnd = Math.min(rangeEnd, getEdgeFlowAt(nextShape.start));
        }

        // The block's sides are straight, so its breadth changes steadily along the flow. Cut off
        // the part of the range where the block is too narrow to reach the cross position
        const startBreadth = start.crossMax - start.crossMin;
        const endBreadth = end.crossMax - end.crossMin;
        const neededBreadth = 2 * Math.abs(cross - crossCenter);

        if (startBreadth !== endBreadth) {
            const t = (neededBreadth - startBreadth) / (endBreadth - startBreadth);
            const sideFlow = start.flow + ((end.flow - start.flow) * t);

            if (endBreadth < startBreadth) {
                rangeEnd = Math.min(rangeEnd, sideFlow);
            } else {
                rangeStart = Math.max(rangeStart, sideFlow);
            }
        } else if (neededBreadth > startBreadth) {
            return null;
        }

        return rangeStart <= rangeEnd ? { start: rangeStart, end: rangeEnd } : null;
    }
}

export default D3Funnel;
