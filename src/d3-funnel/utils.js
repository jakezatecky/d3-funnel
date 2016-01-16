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

		/* eslint-disable no-param-reassign */
		for (prop in b) {
			if (b.hasOwnProperty(prop)) {
				if (typeof b[prop] === 'object' && !Array.isArray(b[prop]) && b[prop] !== null) {
					if (typeof a[prop] === 'object' && !Array.isArray(a[prop]) && b[prop] !== null) {
						a[prop] = Utils.extend(a[prop], b[prop]);
					} else {
						a[prop] = Utils.extend({}, b[prop]);
					}
				} else {
					a[prop] = b[prop];
				}
			}
		}
		/* eslint-enable no-param-reassign */

		return a;
	}

}

export default Utils;
