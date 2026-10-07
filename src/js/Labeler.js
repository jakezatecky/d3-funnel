class Labeler {
    /**
     * @param {Object} options The `label` options.
     *
     * @return {void}
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Draw a block's label into the block's group, replacing any label already drawn there.
     *
     * @param {Object} group  The block's <g> selection.
     * @param {Object} label  The block's `label` data.
     * @param {Object} bounds The part of the block that the label can occupy, with `centerX`,
     *                        `top`, `bottom`, and a `getWidthAt(y)` function.
     *
     * @return {void}
     */
    draw(group, label, bounds) {
        const { options } = this;

        // Remove any existing label
        group.select('text').remove();

        if (!options.enabled || !label.enabled) {
            return;
        }

        const lines = label.formatted.split('\n');

        // Center the text horizontally
        const x = bounds.centerX;

        const text = group.append('text')
            .attr('x', x)
            .attr('fill', label.color)
            .attr('font-size', label.fontSize)
            .attr('font-family', label.fontFamily)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('pointer-events', 'none')
            // The block's group already gives screen readers its accessible text
            .attr('aria-hidden', 'true');

        // Lines are spaced by the rendered font size, which is only known once the text exists.
        // Fall back to the configured size if the chart is not attached to the document
        const fontSize = parseFloat(window.getComputedStyle(text.node()).fontSize) ||
            parseFloat(label.fontSize);
        const lineHeight = fontSize * options.lineHeight;

        // Position the text at the vertical center of all its lines
        const y = this.getTextY(bounds, lines.length, lineHeight);
        const firstLineY = y - ((lineHeight * (lines.length - 1)) / 2);

        text.attr('y', y);

        lines.forEach((line, i) => {
            // Each line is offset from the one before it
            const tspan = text.append('tspan')
                .attr('x', x)
                .attr('dy', i === 0 ? firstLineY - y : lineHeight)
                .text(line);

            if (options.overflow === 'ellipsis') {
                const lineY = firstLineY + (lineHeight * i);

                // The block is narrowest at either the top or bottom of the line
                const maxWidth = Math.min(
                    bounds.getWidthAt(lineY - (lineHeight / 2)),
                    bounds.getWidthAt(lineY + (lineHeight / 2)),
                ) - (2 * options.padding);

                this.truncateText(tspan.node(), maxWidth);
            }
        });
    }

    /**
     * Returns the y position of the vertical center of a label's text, according to the
     * `label.verticalAlign` setting.
     *
     * @param {Object} bounds
     * @param {Number} lineCount
     * @param {Number} lineHeight
     *
     * @return {Number}
     */
    getTextY({ top, bottom }, lineCount, lineHeight) {
        const { padding, verticalAlign } = this.options;
        const offset = padding + ((lineHeight * lineCount) / 2);

        if (verticalAlign === 'top') {
            return top + offset;
        }

        if (verticalAlign === 'bottom') {
            return bottom - offset;
        }

        return (top + bottom) / 2;
    }

    /**
     * Shorten the text of the given element with an ellipsis until it is no wider than the given
     * width.
     *
     * @param {SVGTextContentElement} node
     * @param {Number}                maxWidth
     *
     * @return {void}
     */
    /* eslint-disable no-param-reassign */
    truncateText(node, maxWidth) {
        if (node.getComputedTextLength() <= maxWidth) {
            return;
        }

        // Split by code point to avoid breaking apart surrogate pairs
        const chars = Array.from(node.textContent);
        const truncate = (length) => `${chars.slice(0, length).join('').trimEnd()}…`;

        // Binary search for the longest prefix that fits
        let low = 0;
        let high = chars.length - 1;

        while (low < high) {
            const mid = Math.ceil((low + high) / 2);

            node.textContent = truncate(mid);

            if (node.getComputedTextLength() <= maxWidth) {
                low = mid;
            } else {
                high = mid - 1;
            }
        }

        node.textContent = truncate(low);

        // Hide the text entirely if not even the ellipsis fits
        if (node.getComputedTextLength() > maxWidth) {
            node.textContent = '';
        }
    }
    /* eslint-enable no-param-reassign */
}

export default Labeler;
