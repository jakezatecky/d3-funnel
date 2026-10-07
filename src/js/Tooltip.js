class Tooltip {
    /**
     * @param {HTMLElement} container The element to add the tooltip to.
     * @param {Object}      options   The `tooltip` options.
     *
     * @return {void}
     */
    constructor(container, options) {
        this.container = container;
        this.options = options;

        // Created when first shown, then reused, so that moving between blocks only updates it
        this.element = null;
    }

    /**
     * Show the tooltip beside the mouse, creating the tooltip if needed.
     *
     * @param {MouseEvent} event
     * @param {string}     text
     * @param {string}     borderColor
     *
     * @return {void}
     */
    show(event, text, borderColor) {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.setAttribute('class', 'd3-funnel-tooltip');

            // The tooltip only shows mouse users what screen readers announce from the chart itself
            this.element.setAttribute('aria-hidden', 'true');

            this.container.appendChild(this.element);
        }

        // Style the tooltip before measuring it, as its styles determine its size
        this.element.innerText = text;
        this.element.setAttribute('style', this.getStyle(borderColor));

        this.position(event);
    }

    /**
     * Hide the tooltip, if shown.
     *
     * @return {void}
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    /**
     * Return the inline style of the tooltip, placing it at `left: 0; top: 0` until positioned.
     *
     * @param {string} borderColor
     *
     * @return {string}
     */
    getStyle(borderColor) {
        const styles = [
            // Position the tooltip without letting it catch the mouse
            'display: inline-block',
            'position: absolute',
            'left: 0',
            'top: 0',
            'pointer-events: none',

            // Outline the tooltip in the given color, unless styled otherwise
            `border-color: ${borderColor}`,

            // Apply the configured styles, skipping any removed with `null`
            ...Object.entries(this.options.style)
                .filter(([, value]) => value !== null)
                .map(([property, value]) => `${property}: ${value}`),
        ];

        return styles.join(';');
    }

    /**
     * Center the tooltip above the mouse, or below it if there is no room above the container.
     *
     * @param {MouseEvent} event
     *
     * @return {void}
     */
    position(event) {
        const { offset } = this.options;
        const containerTop = this.container.getBoundingClientRect().top;

        // While at `left: 0; top: 0`, the tooltip sits at the origin of whichever element it is
        // positioned relative to, such as a positioned ancestor or the page itself
        const origin = this.element.getBoundingClientRect();

        // The desired top-left corner of the tooltip, relative to the viewport
        const fitsAbove = event.clientY - origin.height - offset >= containerTop;
        const x = event.clientX - (origin.width / 2);
        const y = fitsAbove ? event.clientY - origin.height - offset : event.clientY + offset;

        this.element.style.left = `${x - origin.left}px`;
        this.element.style.top = `${y - origin.top}px`;
    }
}

export default Tooltip;
