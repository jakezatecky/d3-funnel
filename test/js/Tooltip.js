import { assert } from 'chai';

import Tooltip from '#js/Tooltip.js';

describe('Tooltip', () => {
    let container;

    function getTooltip(options = {}) {
        return new Tooltip(container, {
            offset: 5,
            style: {
                'border-style': 'solid',
                'border-width': '1px',
                padding: '5px 15px',
            },
            ...options,
        });
    }

    function getElement() {
        return container.querySelector('.d3-funnel-tooltip');
    }

    function mouseAt(clientX, clientY) {
        return new MouseEvent('mousemove', { clientX, clientY });
    }

    beforeEach(() => {
        container = document.createElement('div');
        container.style.height = '300px';
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
    });

    describe('show', () => {
        it('should add the tooltip to the container with the given text', () => {
            getTooltip().show(mouseAt(100, 100), 'Visitors: 150', '#808080');

            assert.equal('Visitors: 150', getElement().innerText);
            assert.equal('inline-block', getElement().style.display);
        });

        it('should reuse the same tooltip when shown again', () => {
            const tooltip = getTooltip();

            tooltip.show(mouseAt(100, 100), 'First', '#808080');
            tooltip.show(mouseAt(100, 100), 'Second', '#808080');

            assert.equal(1, container.querySelectorAll('.d3-funnel-tooltip').length);
            assert.equal('Second', getElement().innerText);
        });

        it('should center the tooltip above the mouse on the first show', () => {
            const { top } = container.getBoundingClientRect();

            getTooltip().show(mouseAt(150, top + 150), 'Text', '#808080');

            const rect = getElement().getBoundingClientRect();

            assert.closeTo(rect.left + (rect.width / 2), 150, 0.5);
            assert.closeTo(rect.bottom, top + 145, 0.5);
        });

        it('should place the tooltip below the mouse when there is no room above the container', () => {
            const { top } = container.getBoundingClientRect();

            getTooltip().show(mouseAt(150, top + 10), 'Text', '#808080');

            assert.closeTo(getElement().getBoundingClientRect().top, top + 15, 0.5);
        });

        it('should keep the given offset between the tooltip and the mouse', () => {
            const { top } = container.getBoundingClientRect();

            getTooltip({ offset: 20 }).show(mouseAt(150, top + 150), 'Text', '#808080');

            assert.closeTo(getElement().getBoundingClientRect().bottom, top + 130, 0.5);
        });

        it('should position the tooltip correctly within a positioned container', () => {
            container.style.position = 'relative';
            container.style.marginLeft = '40px';
            container.style.paddingTop = '30px';

            const { top } = container.getBoundingClientRect();

            getTooltip().show(mouseAt(150, top + 150), 'Text', '#808080');

            const rect = getElement().getBoundingClientRect();

            assert.closeTo(rect.left + (rect.width / 2), 150, 0.5);
            assert.closeTo(rect.bottom, top + 145, 0.5);
        });

        it('should outline the tooltip in the given border color', () => {
            getTooltip().show(mouseAt(100, 100), 'Text', '#808080');

            assert.equal('rgb(128, 128, 128)', getComputedStyle(getElement()).borderTopColor);
        });

        it('should let a configured border color override the given one', () => {
            getTooltip({ style: { 'border-color': 'rgb(255, 0, 0)' } }).show(mouseAt(100, 100), 'Text', '#808080');

            assert.equal('rgb(255, 0, 0)', getComputedStyle(getElement()).borderTopColor);
        });

        it('should skip styles set to null', () => {
            getTooltip({ style: { 'font-weight': null } }).show(mouseAt(100, 100), 'Text', '#808080');

            assert.equal('', getElement().style.fontWeight);
        });
    });

    describe('hide', () => {
        it('should hide a shown tooltip', () => {
            const tooltip = getTooltip();

            tooltip.show(mouseAt(100, 100), 'Text', '#808080');
            tooltip.hide();

            assert.equal('none', getElement().style.display);
        });

        it('should do nothing when the tooltip has not been shown', () => {
            getTooltip().hide();

            assert.isNull(getElement());
        });
    });
});
