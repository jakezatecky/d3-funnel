class Navigator {
	/**
	 * Given a list of path commands, returns the compiled description.
	 *
	 * @param {Array} commands
	 *
	 * @return {string}
	 */
	plot(commands) {
		let path = '';

		commands.forEach((command) => {
			path += `${command[0]}${command[1]},${command[2]} `;
		});

		return path.replace(/ +/g, ' ').trim();
	}

	/**
	 * @param {Object}  dimensions
	 * @param {boolean} isValueOverlay
	 *
	 * @return {Array}
	 */
	makeCurvedPaths(dimensions, isValueOverlay = false) {
		const points = this.makeBezierPoints(dimensions);

		if (isValueOverlay) {
			return this.makeBezierPath(points, dimensions.ratio);
		}

		return this.makeBezierPath(points);
	}

	/**
	 * @param {Number} centerX
	 * @param {Number} prevLeftX
	 * @param {Number} prevRightX
	 * @param {Number} prevHeight
	 * @param {Number} nextLeftX
	 * @param {Number} nextRightX
	 * @param {Number} nextHeight
	 * @param {Number} curveHeight
	 *
	 * @return {Object}
	 */
	makeBezierPoints({
		centerX,
		prevLeftX,
		prevRightX,
		prevHeight,
		nextLeftX,
		nextRightX,
		nextHeight,
		curveHeight,
	}) {
		return {
			p00: {
				x: prevLeftX,
				y: prevHeight,
			},
			p01: {
				x: centerX,
				y: prevHeight + (curveHeight - 10),
			},
			p02: {
				x: prevRightX,
				y: prevHeight,
			},

			p10: {
				x: nextLeftX,
				y: nextHeight,
			},
			p11: {
				x: centerX,
				y: nextHeight + curveHeight,
			},
			p12: {
				x: nextRightX,
				y: nextHeight,
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
	makeBezierPath({ p00, p01, p02, p10, p11, p12 }, ratio = 1) {
		const curve0 = this.getQuadraticBezierCurve(p00, p01, p02, ratio);
		const curve1 = this.getQuadraticBezierCurve(p10, p11, p12, ratio);

		return [
			// Top Bezier curve
			[curve0.p0.x, curve0.p0.y, 'M'],
			[curve0.p1.x, curve0.p1.y, 'Q'],
			[curve0.p2.x, curve0.p2.y, ''],
			// Right line
			[curve1.p2.x, curve1.p2.y, 'L'],
			// Bottom Bezier curve
			[curve1.p2.x, curve1.p2.y, 'M'],
			[curve1.p1.x, curve1.p1.y, 'Q'],
			[curve1.p0.x, curve1.p0.y, ''],
			// Left line
			[curve0.p0.x, curve0.p0.y, 'L'],
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
		// Quadratic Bezier curve syntax: M(P0) Q(P1) P2
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
		return (Math.pow(1 - t, 2) * p0[axis]) +
			(2 * (1 - t) * t * p1[axis]) +
			(Math.pow(t, 2) * p2[axis]);
	}

	/**
	 * @param {Number}  prevLeftX
	 * @param {Number}  prevRightX
	 * @param {Number}  prevHeight
	 * @param {Number}  nextLeftX
	 * @param {Number}  nextRightX
	 * @param {Number}  nextHeight
	 * @param {Number}  ratio
	 * @param {boolean} isValueOverlay
	 *
	 * @return {Object}
	 */
	makeStraightPaths({
		prevLeftX,
		prevRightX,
		prevHeight,
		nextLeftX,
		nextRightX,
		nextHeight,
		ratio,
	}, isValueOverlay = false) {
		if (isValueOverlay) {
			const lengthTop = (prevRightX - prevLeftX);
			const lengthBtm = (nextRightX - nextLeftX);
			let rightSideTop = (lengthTop * (ratio || 0)) + prevLeftX;
			let rightSideBtm = (lengthBtm * (ratio || 0)) + nextLeftX;

			// Overlay should not be longer than the max length of the path
			rightSideTop = Math.min(rightSideTop, lengthTop);
			rightSideBtm = Math.min(rightSideBtm, lengthBtm);

			return [
				// Start position
				[prevLeftX, prevHeight, 'M'],
				// Move to right
				[rightSideTop, prevHeight, 'L'],
				// Move down
				[rightSideBtm, nextHeight, 'L'],
				// Move to left
				[nextLeftX, nextHeight, 'L'],
				// Wrap back to top
				[prevLeftX, prevHeight, 'L'],
			];
		}

		return [
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
		];
	}
}

export default Navigator;
