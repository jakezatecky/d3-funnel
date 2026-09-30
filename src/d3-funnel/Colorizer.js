class Colorizer {
    /**
     * @return {void}
     */
    constructor() {
        this.hexExpression = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
        this.instanceId = null;
        this.labelFill = null;
        this.scale = null;
    }

    /**
     * @param {string} instanceId
     *
     * @return {void}
     */
    setInstanceId(instanceId) {
        this.instanceId = instanceId;
    }

    /**
     * @param {string} fill
     *
     * @return {void}
     */
    setLabelFill(fill) {
        this.labelFill = fill;
    }

    /**
     * @param {function|Array} scale
     *
     * @return {void}
     */
    setScale(scale) {
        this.scale = scale;
    }

    /**
     * Given a raw data block, return an appropriate color for the block.
     *
     * @param {string} fill
     * @param {Number} index
     * @param {string} fillType
     *
     * @return {Object}
     */
    getBlockFill(fill, index, fillType) {
        const raw = this.getBlockRawFill(fill, index);

        return {
            raw,
            actual: this.getBlockActualFill(raw, index, fillType),
        };
    }

    /**
     * Return the raw hex color for the block.
     *
     * @param {string} fill
     * @param {Number} index
     *
     * @return {string}
     */
    getBlockRawFill(fill, index) {
        // Use the block's color, if set and valid
        if (this.hexExpression.test(fill)) {
            return fill;
        }

        // Otherwise, attempt to use the array scale
        if (Array.isArray(this.scale)) {
            return this.scale[index];
        }

        // Finally, use a functional scale
        return this.scale(index);
    }

    /**
     * Return the actual background for the block.
     *
     * @param {string} raw
     * @param {Number} index
     * @param {string} fillType
     *
     * @return {string}
     */
    getBlockActualFill(raw, index, fillType) {
        if (fillType === 'solid') {
            return raw;
        }

        return `url(#${this.getGradientId(index)})`;
    }

    /**
     * Return the gradient ID for the given index.
     *
     * @param {Number} index
     *
     * @return {string}
     */
    getGradientId(index) {
        return `${this.instanceId}-gradient-${index}`;
    }

    /**
     * Given a raw data block, return an appropriate label color.
     *
     * @param {string} labelFill
     *
     * @return {string}
     */
    getLabelColor(labelFill) {
        return this.hexExpression.test(labelFill) ? labelFill : this.labelFill;
    }

    /**
     * Shade a color to the given percentage.
     *
     * A positive shade lightens the color by moving each channel that far
     * toward white; a negative shade darkens it by moving each channel that
     * far toward black. For example, `0.5` is halfway to white.
     *
     * @param {string} color A hex color.
     * @param {number} shade The shade adjustment, from `-1` to `1`.
     *
     * @return {string}
     */
    shade(color, shade) {
        const { R, G, B } = this.hexToRgb(color);
        const target = shade < 0 ? 0 : 255;
        const amount = Math.abs(shade);

        /**
         * Move the channel toward the target and write it as a pair of hex digits.
         *
         * @param {number} channel
         *
         * @return {string}
         */
        const shadeChannel = (channel) => {
            const shaded = channel + Math.round((target - channel) * amount);

            return shaded.toString(16).padStart(2, '0');
        };

        return `#${shadeChannel(R)}${shadeChannel(G)}${shadeChannel(B)}`;
    }

    /**
     * Convert a hex color to an RGB object.
     *
     * @param {string} color
     *
     * @returns {{R: Number, G: number, B: number}}
     */
    hexToRgb(color) {
        let hex = color.slice(1);

        if (hex.length === 3) {
            hex = this.expandHex(hex);
        }

        // Each channel is a pair of hex digits: #RRGGBB
        return {
            R: parseInt(hex.slice(0, 2), 16),
            G: parseInt(hex.slice(2, 4), 16),
            B: parseInt(hex.slice(4, 6), 16),
        };
    }

    /**
     * Expands a three character hex code to six characters.
     *
     * @param {string} hex
     *
     * @return {string}
     */
    expandHex(hex) {
        return hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
}

export default Colorizer;
