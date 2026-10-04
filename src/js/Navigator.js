class Navigator {
    /**
     * Given a list of path commands, returns the compiled description.
     *
     * @param {Array} commands Each as [command, x, y].
     *
     * @return {string}
     */
    plot(commands) {
        return commands
            .map(([command, x, y]) => `${command}${x},${y}`)
            .join(' ');
    }

    /**
     * @param {Object}      shape        A block shape, as described by `D3Funnel.makeBlockShapes`.
     * @param {Number|null} overlayRatio When given, the path covers only this fraction of the
     *                                   block's breadth, as a bar overlay.
     *
     * @return {Array}
     */
    makeCurvedPaths(shape, overlayRatio = null) {
        return this.makeBezierPath(this.makeBezierPoints(shape), overlayRatio ?? 1);
    }

    /**
     * @param {Number} crossCenter
     * @param {Object} start
     * @param {Object} end
     *
     * @return {Object}
     */
    makeBezierPoints({ crossCenter, start, end }) {
        // A quadratic curve bulges halfway to its control point
        return {
            p00: {
                cross: start.crossMin,
                flow: start.flow,
            },
            p01: {
                cross: crossCenter,
                flow: start.flow + (2 * start.curveDepth),
            },
            p02: {
                cross: start.crossMax,
                flow: start.flow,
            },

            p10: {
                cross: end.crossMin,
                flow: end.flow,
            },
            p11: {
                cross: crossCenter,
                flow: end.flow + (2 * end.curveDepth),
            },
            p12: {
                cross: end.crossMax,
                flow: end.flow,
            },
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
    makeBezierPath({
        p00,
        p01,
        p02,
        p10,
        p11,
        p12,
    }, ratio = 1) {
        const curve0 = this.getQuadraticBezierCurve(p00, p01, p02, ratio);
        const curve1 = this.getQuadraticBezierCurve(p10, p11, p12, ratio);

        return [
            // Start Bézier curve
            ['M', curve0.p0.cross, curve0.p0.flow],
            ['Q', curve0.p1.cross, curve0.p1.flow],
            ['', curve0.p2.cross, curve0.p2.flow],
            // Side line at the maximum cross position
            ['L', curve1.p2.cross, curve1.p2.flow],
            // End Bézier curve
            ['M', curve1.p2.cross, curve1.p2.flow],
            ['Q', curve1.p1.cross, curve1.p1.flow],
            ['', curve1.p0.cross, curve1.p0.flow],
            // Side line at the minimum cross position
            ['L', curve0.p0.cross, curve0.p0.flow],
        ];
    }

    /**
     * @param {Object} p0
     * @param {Object} p1
     * @param {Object} p2
     * @param {Number} t
     *
     * @return {Object}
     */
    getQuadraticBezierCurve(p0, p1, p2, t = 1) {
        // Quadratic Bézier curve syntax: M(P0) Q(P1) P2
        // Where P0, P2 are the curve endpoints and P1 is the control point

        // More generally, at 0 <= t <= 1, we have the following:
        // Q0(t), which varies linearly from P0 to P1
        // Q1(t), which varies linearly from P1 to P2
        // B(t), which is interpolated linearly between Q0(t) and Q1(t)

        // For an intermediate curve at 0 <= t <= 1:
        // P1(t) = Q0(t)
        // P2(t) = B(t)

        return {
            p0,
            p1: {
                cross: this.getLinearInterpolation(p0, p1, t, 'cross'),
                flow: this.getLinearInterpolation(p0, p1, t, 'flow'),
            },
            p2: {
                cross: this.getQuadraticInterpolation(p0, p1, p2, t, 'cross'),
                flow: this.getQuadraticInterpolation(p0, p1, p2, t, 'flow'),
            },
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
    getLinearInterpolation(p0, p1, t, axis) {
        return p0[axis] + (t * (p1[axis] - p0[axis]));
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
    getQuadraticInterpolation(p0, p1, p2, t, axis) {
        return (((1 - t) ** 2) * p0[axis]) +
            (2 * (1 - t) * t * p1[axis]) +
            ((t ** 2) * p2[axis]);
    }

    /**
     * @param {Object}      shape        A block shape, as described by `D3Funnel.makeBlockShapes`.
     * @param {Number|null} overlayRatio When given, the path covers only this fraction of the
     *                                   block's breadth, as a bar overlay.
     *
     * @return {Array}
     */
    makeStraightPaths({ start, end }, overlayRatio = null) {
        let startCrossMax = start.crossMax;
        let endCrossMax = end.crossMax;

        if (overlayRatio !== null) {
            const ratio = overlayRatio || 0;
            const startBreadth = (start.crossMax - start.crossMin);
            const endBreadth = (end.crossMax - end.crossMin);

            // Overlay covers its ratio of the path, but should not extend past the path's side at
            // the maximum cross position
            startCrossMax = Math.min((startBreadth * ratio) + start.crossMin, start.crossMax);
            endCrossMax = Math.min((endBreadth * ratio) + end.crossMin, end.crossMax);
        }

        return [
            // Start position
            ['M', start.crossMin, start.flow],
            // Move across the start edge
            ['L', startCrossMax, start.flow],
            // Move along the flow
            ['L', endCrossMax, end.flow],
            // Move back across the end edge
            ['L', end.crossMin, end.flow],
            // Wrap back to the start
            ['L', start.crossMin, start.flow],
        ];
    }
}

export default Navigator;
