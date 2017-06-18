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
	 * @param {*}      formattedValue
	 *
	 * @return string
	 */
	format({ label, value, formattedValue = null }) {
		return this.formatter(label, value, formattedValue);
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
	 *
	 * @return {string}
	 */
	stringFormatter(label, value, formattedValue = null) {
		let formatted = formattedValue;

		// Attempt to use supplied formatted value
		// Otherwise, use the default
		if (formattedValue === null) {
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
