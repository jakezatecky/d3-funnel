class LabelFormatter {
	/**
	 * Initial the formatter.
	 *
	 * @return {void}
	 */
	constructor() {
		this.expression = null;
	}

	/**
	 * Register the format function.
	 *
	 * @param {string|function} format
	 *
	 * @return {void}
	 */
	setFormat(format) {
		if (typeof format === 'function') {
			this.formatter = format;
		} else {
			this.expression = format;
			this.formatter = this.stringFormatter;
		}
	}

	/**
	 * Format the given value according to the data point or the format.
	 *
	 * @param {string} label
	 * @param {number} value
	 *
	 * @return string
	 */
	format(label, value) {
		// Try to use any formatted value specified through the data
		// Otherwise, attempt to use the format function
		if (Array.isArray(value)) {
			return this.formatter(label, value[0], value[1]);
		}

		return this.formatter(label, value, null);
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
	 * @param {*}      fValue
	 *
	 * @return {string}
	 */
	stringFormatter(label, value, fValue = null) {
		let formatted = fValue;

		// Attempt to use supplied formatted value
		// Otherwise, use the default
		if (fValue === null) {
			formatted = this.getDefaultFormattedValue(value);
		}

		return this.expression
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

export default LabelFormatter;
