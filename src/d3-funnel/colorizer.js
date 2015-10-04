/* exported Colorizer */
/* jshint bitwise: false */

class Colorizer {

	constructor() {
		this.hexExpression = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

		this.labelFill = null;

		this.scale = null;
	}

	/**
	 * @param {string} fill
	 *
	 * @return {void}
	 */
	setLabelFill(fill) {
		this.labelFill = fill;
	}

	/**
	 * @param {function|Array} scale
	 *
	 * @return {void}
	 */
	setScale(scale) {
		this.scale = scale;
	}

	/**
	 * Given a raw data block, return an appropriate color for the block.
	 *
	 * @param {Array}  block
	 * @param {Number} index
	 *
	 * @return {string}
	 */
	getBlockFill(block, index) {
		// Use the block's color, if set and valid
		if (block.length > 2 && this.hexExpression.test(block[2])) {
			return block[2];
		}

		if (Array.isArray(this.scale)) {
			return this.scale[index];
		}

		return this.scale(index);
	}

	/**
	 * Given a raw data block, return an appropriate label color.
	 *
	 * @param {Array} block
	 *
	 * @return {string}
	 */
	getLabelFill(block) {
		// Use the label's color, if set and valid
		if (block.length > 3 && this.hexExpression.test(block[3])) {
			return block[3];
		}

		return this.labelFill;
	}

	/**
	 * Shade a color to the given percentage.
	 *
	 * @param {string} color A hex color.
	 * @param {number} shade The shade adjustment. Can be positive or negative.
	 *
	 * @return {string}
	 */
	static shade(color, shade) {
		let hex = color.slice(1);

		if (hex.length === 3) {
			hex = Colorizer.expandHex(hex);
		}

		let f = parseInt(hex, 16);
		let t = shade < 0 ? 0 : 255;
		let p = shade < 0 ? shade * -1 : shade;

		let R = f >> 16;
		let G = f >> 8 & 0x00FF;
		let B = f & 0x0000FF;

		let converted = 0x1000000 +
			(Math.round((t - R) * p) + R) * 0x10000 +
			(Math.round((t - G) * p) + G) * 0x100 +
			(Math.round((t - B) * p) + B);

		return '#' + converted.toString(16).slice(1);
	}

	/**
	 * Expands a three character hex code to six characters.
	 *
	 * @param {string} hex
	 *
	 * @return {string}
	 */
	static expandHex(hex) {
		return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

}
