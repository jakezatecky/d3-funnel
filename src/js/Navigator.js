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
     *                                   block's width, as a bar overlay.
     *
     * @return {Array}
     */
    makeCurvedPaths(shape, overlayRatio = null) {
        return this.makeBezierPath(this.makeBezierPoints(shape), overlayRatio ?? 1);
    }

    /**
     * @param {Number} centerX
     * @param {Object} top
     * @param {Object} bottom
     *
     * @return {Object}
     */
    makeBezierPoints({ centerX, top, bottom }) {
        // A quadratic curve dips halfway to its control point
        return {
            p00: {
                x: top.leftX,
                y: top.y,
            },
            p01: {
                x: centerX,
                y: top.y + (2 * top.curveDepth),
            },
            p02: {
                x: top.rightX,
                y: top.y,
            },

            p10: {
                x: bottom.leftX,
                y: bottom.y,
            },
            p11: {
                x: centerX,
                y: bottom.y + (2 * bottom.curveDepth),
            },
            p12: {
                x: bottom.rightX,
                y: bottom.y,
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
            // Top Bézier curve
            ['M', curve0.p0.x, curve0.p0.y],
            ['Q', curve0.p1.x, curve0.p1.y],
            ['', curve0.p2.x, curve0.p2.y],
            // Right line
            ['L', curve1.p2.x, curve1.p2.y],
            // Bottom Bézier curve
            ['M', curve1.p2.x, curve1.p2.y],
            ['Q', curve1.p1.x, curve1.p1.y],
            ['', curve1.p0.x, curve1.p0.y],
            // Left line
            ['L', curve0.p0.x, curve0.p0.y],
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
                x: this.getLinearInterpolation(p0, p1, t, 'x'),
                y: this.getLinearInterpolation(p0, p1, t, 'y'),
            },
            p2: {
                x: this.getQuadraticInterpolation(p0, p1, p2, t, 'x'),
                y: this.getQuadraticInterpolation(p0, p1, p2, t, 'y'),
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
     *                                   block's width, as a bar overlay.
     *
     * @return {Array}
     */
    makeStraightPaths({ top, bottom }, overlayRatio = null) {
        let rightSideTop = top.rightX;
        let rightSideBottom = bottom.rightX;

        if (overlayRatio !== null) {
            const ratio = overlayRatio || 0;
            const lengthTop = (top.rightX - top.leftX);
            const lengthBottom = (bottom.rightX - bottom.leftX);

            // Overlay covers its ratio of the path, but should not extend past the right side of
            // the path
            rightSideTop = Math.min((lengthTop * ratio) + top.leftX, top.rightX);
            rightSideBottom = Math.min((lengthBottom * ratio) + bottom.leftX, bottom.rightX);
        }

        return [
            // Start position
            ['M', top.leftX, top.y],
            // Move to right
            ['L', rightSideTop, top.y],
            // Move down
            ['L', rightSideBottom, bottom.y],
            // Move to left
            ['L', bottom.leftX, bottom.y],
            // Wrap back to top
            ['L', top.leftX, top.y],
        ];
    }
}

export default Navigator;
