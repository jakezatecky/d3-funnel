/* exported Utils */

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
				if (typeof b[prop] === 'object') {
					if (typeof a[prop] === 'object') {
						a[prop] = Utils.extend(a[prop], b[prop]);
					} else {
						a[prop] = Utils.extend({}, b[prop]);
					}
				} else {
					a[prop] = b[prop];
				}
			}
		}

		return a;
	}

}
