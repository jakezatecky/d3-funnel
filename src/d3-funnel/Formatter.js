class Formatter {
    /**
     * Register the format function.
     *
     * @param {string|function} format
     *
     * @return {function}
     */
    getFormatter(format) {
        if (typeof format === 'function') {
            return format;
        }

        return (label, value, formattedValue) => (
            this.stringFormatter(label, value, formattedValue, format)
        );
    }

    /**
     * Format the given value according to the data point or the format.
     *
     * @param {string}   label
     * @param {number}   value
     * @param {*}        formattedValue
     * @param {function} formatter
     *
     * @return string
     */
    format({ label, value, formattedValue = null }, formatter) {
        return formatter(label, value, formattedValue);
    }

    /**
     * Format the string according to a simple expression.
     *
     * {l}: label
     * {v}: raw value
     * {f}: formatted value
     *
     * @param {string} label
     * @param {number} value
     * @param {*}      formattedValue
     * @param {string} expression
     *
     * @return {string}
     */
    stringFormatter(label, value, formattedValue, expression) {
        let formatted = formattedValue;

        // Attempt to use supplied formatted value
        // Otherwise, use the default
        if (formattedValue === null) {
            formatted = this.getDefaultFormattedValue(value);
        }

        return expression
            .split('{l}')
            .join(label)
            .split('{v}')
            .join(value)
            .split('{f}')
            .join(formatted);
    }

    /**
     * @param {number} value
     *
     * @return {string}
     */
    getDefaultFormattedValue(value) {
        return value.toLocaleString();
    }
}

export default Formatter;
