class Utils {
	/**
	 * Determine whether the given parameter is an extendable object.
	 *
	 * @param {*} a
	 *
	 * @return {boolean}
	 */
	static isExtendableObject(a) {
		return typeof a === 'object' && a !== null && !Array.isArray(a);
	}

	/**
	 * Extends an object with the members of another.
	 *
	 * @param {Object} a The object to be extended.
	 * @param {Object} b The object to clone from.
	 *
	 * @return {Object}
	 */
	static extend(a, b) {
		let result = {};

		// If a is non-trivial, extend the result with it
		if (Object.keys(a).length > 0) {
			result = Utils.extend({}, a);
		}

		// Copy over the properties in b into a
		Object.keys(b).forEach((prop) => {
			if (Utils.isExtendableObject(b[prop])) {
				if (Utils.isExtendableObject(a[prop])) {
					result[prop] = Utils.extend(a[prop], b[prop]);
				} else {
					result[prop] = Utils.extend({}, b[prop]);
				}
			} else {
				result[prop] = b[prop];
			}
		});

		return result;
	}
}

export default Utils;
