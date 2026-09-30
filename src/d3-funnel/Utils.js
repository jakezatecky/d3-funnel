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
        const result = {};

        // Deep copy the properties of `a`, then those of `b` over them, so
        // that neither object is modified
        [a, b].forEach((source) => {
            Object.keys(source).forEach((prop) => {
                if (Utils.isExtendableObject(source[prop])) {
                    const base = Utils.isExtendableObject(result[prop]) ? result[prop] : {};

                    result[prop] = Utils.extend(base, source[prop]);
                } else {
                    result[prop] = source[prop];
                }
            });
        });

        return result;
    }
}

export default Utils;
