/* exported Utils */
/* jshint bitwise: false */

/**
 * Simple utility class.
 */
class Utils {

	/**
	 * Extends an object with the members of another.
	 *
	 * @param {Object} a The object to be extended.
	 * @param {Object} b The object to clone from.
	 *
	 * @return {Object}
	 */
	static extend(a, b) {
		let prop;

		for (prop in b) {
			if (b.hasOwnProperty(prop)) {
				if (typeof a[prop] === 'object' && typeof b[prop] === 'object') {
					a[prop] = Utils.extend(a[prop], b[prop]);
				} else {
					a[prop] = b[prop];
				}
			}
		}

		return a;
	}

	/**
	 * Shade a color to the given percentage.
	 *
	 * @param {string} color A hex color.
	 * @param {number} shade The shade adjustment. Can be positive or negative.
	 *
	 * @return {string}
	 */
	static shadeColor(color, shade) {
		let f = parseInt(color.slice(1), 16);
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

}
