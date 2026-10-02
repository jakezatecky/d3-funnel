import { select } from 'd3';
import { assert } from 'chai';

import Labeler from '#js/Labeler.js';

describe('Labeler', () => {
    let container;
    let group;

    function getLabeler(options = {}) {
        return new Labeler({
            enabled: true,
            lineHeight: 1,
            verticalAlign: 'middle',
            overflow: 'visible',
            padding: 5,
            ...options,
        });
    }

    function getLabel(label = {}) {
        return {
            enabled: true,
            formatted: 'Label',
            color: '#fff',
            fontSize: '20px',
            fontFamily: null,
            ...label,
        };
    }

    function getBounds(bounds = {}) {
        return {
            centerX: 150,
            top: 0,
            bottom: 100,
            getWidthAt: () => 300,
            ...bounds,
        };
    }

    function getText() {
        return container.querySelector('text');
    }

    function getLines() {
        return Array.from(container.querySelectorAll('tspan'));
    }

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        group = select(container).append('svg').append('g');
    });

    afterEach(() => {
        container.remove();
    });

    describe('draw', () => {
        it('should draw each line of the label at the center of the bounds', () => {
            getLabeler().draw(group, getLabel({ formatted: 'First\nSecond' }), getBounds());

            assert.equal('150', getText().getAttribute('x'));
            assert.deepEqual(['First', 'Second'], getLines().map((line) => line.textContent));
        });

        it('should replace an existing label', () => {
            const labeler = getLabeler();

            labeler.draw(group, getLabel({ formatted: 'First' }), getBounds());
            labeler.draw(group, getLabel({ formatted: 'Second' }), getBounds());

            assert.equal(1, container.querySelectorAll('text').length);
            assert.equal('Second', getText().textContent);
        });

        it('should remove an existing label when the label is disabled', () => {
            const labeler = getLabeler();

            labeler.draw(group, getLabel(), getBounds());
            labeler.draw(group, getLabel({ enabled: false }), getBounds());

            assert.isNull(getText());
        });

        it('should draw nothing when labels are disabled', () => {
            getLabeler({ enabled: false }).draw(group, getLabel(), getBounds());

            assert.isNull(getText());
        });

        it('should align the label within the top and bottom of the bounds', () => {
            const getY = (verticalAlign) => {
                getLabeler({ verticalAlign }).draw(group, getLabel(), getBounds());

                return parseFloat(getText().getAttribute('y'));
            };

            // Half of a 20px line plus 5px padding from the edge
            assert.equal(15, getY('top'));
            assert.equal(50, getY('middle'));
            assert.equal(85, getY('bottom'));
        });

        it('should fit each line within the narrowest width across its height', () => {
            const ys = [];
            const getWidthAt = (y) => {
                ys.push(y);

                return y < 50 ? 1000 : 40;
            };

            getLabeler({ overflow: 'ellipsis' }).draw(
                group,
                getLabel({ formatted: 'A label that is much too long' }),
                getBounds({ getWidthAt }),
            );

            // The 20px line is centered at y = 50
            assert.deepEqual([40, 60], ys);

            // The 40px width, minus 5px padding on each side
            assert.isTrue(getText().textContent.endsWith('…'));
            assert.isAtMost(getLines()[0].getComputedTextLength(), 30);
        });
    });
});
