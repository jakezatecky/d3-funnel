class Formatter {
    /**
     * Format the given block according to a format function or a string
     * expression, in which the following keys are substituted:
     *
     * {l}: label
     * {v}: raw value
     * {f}: formatted value
     *
     * @param {Object}          block
     * @param {string|function} format
     *
     * @return {string}
     */
    static format({ label, value, formattedValue = null }, format) {
        if (typeof format === 'function') {
            return format(label, value, formattedValue);
        }

        // Use the supplied formatted value, if any
        const formatted = formattedValue ?? value.toLocaleString();

        // Replace each key literally
        return format
            .split('{l}')
            .join(label)
            .split('{v}')
            .join(String(value))
            .split('{f}')
            .join(formatted);
    }
}

export default Formatter;
