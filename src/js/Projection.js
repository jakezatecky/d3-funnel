/**
 * Maps the funnel from flow space onto the screen.
 *
 * The funnel is laid out in flow space, where the flow axis runs along the funnel from its first
 * block to its last, and the cross axis runs across it. When the funnel flows down the screen, the
 * cross axis is x and the flow axis is y.
 */
class Projection {
    /**
     * @param {Number} width     The width of the chart on screen.
     * @param {Number} height    The height of the chart on screen.
     * @param {string} direction The direction the funnel flows: `down`, `right`, `up`, or `left`.
     *
     * @return {void}
     */
    constructor(width, height, direction = 'down') {
        if (!['down', 'right', 'up', 'left'].includes(direction)) {
            throw new Error(`Unknown chart direction: ${direction}.`);
        }

        // Funnels flowing right or left run along the width of the chart, and those flowing up or
        // left run against the screen's axes
        this.isHorizontal = direction === 'right' || direction === 'left';
        this.isMirrored = direction === 'up' || direction === 'left';

        this.length = this.isHorizontal ? width : height;
        this.breadth = this.isHorizontal ? height : width;
    }

    /**
     * Returns the screen position of the given point in flow space.
     *
     * @param {Number} cross
     * @param {Number} flow
     *
     * @return {{x: Number, y: Number}}
     */
    projectPoint(cross, flow) {
        if (this.isHorizontal) {
            return {
                x: this.projectFlow(flow),
                y: this.projectCross(cross),
            };
        }

        return {
            x: this.projectCross(cross),
            y: this.projectFlow(flow),
        };
    }

    /**
     * Returns the screen position along the flow axis of the given flow position. Mirroring is its
     * own inverse, so this also maps a screen position back to a flow position.
     *
     * @param {Number} flow
     *
     * @return {Number}
     */
    projectFlow(flow) {
        return this.isMirrored ? this.length - flow : flow;
    }

    /**
     * Returns the screen position along the cross axis of the given cross position. Horizontal
     * funnels put the minimum cross position at the bottom, so that bar overlays rise like columns.
     * This is also its own inverse.
     *
     * @param {Number} cross
     *
     * @return {Number}
     */
    projectCross(cross) {
        return this.isHorizontal ? this.breadth - cross : cross;
    }

    /**
     * Returns the given path commands with each point projected onto the screen.
     *
     * @param {Array} commands Each as [command, cross, flow].
     *
     * @return {Array} Each as [command, x, y].
     */
    projectPath(commands) {
        return commands.map(([command, cross, flow]) => {
            const { x, y } = this.projectPoint(cross, flow);

            return [command, x, y];
        });
    }

    /**
     * Returns the screen-space bounds of the part of a block that its label can occupy.
     *
     * @param {Number}   crossCenter    The cross position of the block's center.
     * @param {Number}   start          The flow position where the block becomes visible.
     * @param {Number}   end            The flow position where the block stops being visible.
     * @param {Function} getBreadthAt   Returns the block's breadth at a flow position.
     * @param {Function} getFlowRangeAt Returns the `start` and `end` flow positions where the block
     *                                  is visible at a cross position, or null if it is not.
     *
     * @return {{centerX: Number, top: Number, bottom: Number, getWidthAt: Function}}
     */
    projectBounds({
        crossCenter,
        start,
        end,
        getBreadthAt,
        getFlowRangeAt,
    }) {
        if (!this.isHorizontal) {
            // A mirrored funnel starts at the bottom of the screen
            const [top, bottom] = this.isMirrored ?
                [this.projectFlow(end), this.projectFlow(start)] :
                [this.projectFlow(start), this.projectFlow(end)];

            return {
                centerX: this.projectCross(crossCenter),
                top,
                bottom,
                getWidthAt: (y) => getBreadthAt(this.projectFlow(y)),
            };
        }

        // Center the label along the flow, between the block's sides at that point
        const middle = (start + end) / 2;
        const halfBreadth = getBreadthAt(middle) / 2;

        return {
            centerX: this.projectFlow(middle),
            top: this.projectCross(crossCenter + halfBreadth),
            bottom: this.projectCross(crossCenter - halfBreadth),
            getWidthAt: (y) => {
                const range = getFlowRangeAt(this.projectCross(y));

                if (range === null) {
                    return 0;
                }

                // A centered line only has as much room as the nearer end of the block allows
                return 2 * Math.max(Math.min(middle - range.start, range.end - middle), 0);
            },
        };
    }
}

export default Projection;
