/**
 * Maps the funnel from flow space onto the screen.
 *
 * The funnel is laid out in flow space, where the flow axis runs along the funnel from its first
 * block to its last, and the cross axis runs across it. The funnel flows down the screen, so the
 * cross axis is x and the flow axis is y.
 */
class Projection {
    /**
     * @param {Number} width  The width of the chart on screen.
     * @param {Number} height The height of the chart on screen.
     *
     * @return {void}
     */
    constructor(width, height) {
        // The funnel is as long as the chart is high
        this.length = height;
        this.breadth = width;
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
        return {
            x: cross,
            y: flow,
        };
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
     * @param {Number}   crossCenter  The cross position of the block's center.
     * @param {Number}   start        The flow position where the block becomes visible.
     * @param {Number}   end          The flow position where the block stops being visible.
     * @param {Function} getBreadthAt Returns the block's breadth at a flow position.
     *
     * @return {{centerX: Number, top: Number, bottom: Number, getWidthAt: Function}}
     */
    projectBounds({
        crossCenter,
        start,
        end,
        getBreadthAt,
    }) {
        return {
            centerX: crossCenter,
            top: start,
            bottom: end,
            getWidthAt: (y) => getBreadthAt(y),
        };
    }
}

export default Projection;
