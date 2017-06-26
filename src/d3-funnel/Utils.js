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

    /**
     * Convert the legacy block array to a block object.
     *
     * @param {Array} block
     *
     * @returns {Object}
     */
    static convertLegacyBlock(block) {
        return {
            label: block[0],
            value: Utils.getRawBlockCount(block),
            formattedValue: Array.isArray(block[1]) ? block[1][1] : null,
            backgroundColor: block[2],
            labelColor: block[3],
        };
    }

    /**
     * Given a raw data block, return its count.
     *
     * @param {Array} block
     *
     * @return {Number}
     */
    static getRawBlockCount(block) {
        if (Array.isArray(block)) {
            return Array.isArray(block[1]) ? block[1][0] : block[1];
        }

        return block.value;
    }
}

export default Utils;
