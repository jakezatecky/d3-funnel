import { assert } from 'chai';

import Projection from '#js/Projection.js';

describe('Projection', () => {
    function getProjection(direction) {
        return new Projection(300, 400, direction);
    }

    describe('constructor', () => {
        it('should make the funnel as long as the chart is high and as broad as it is wide', () => {
            const { length, breadth } = getProjection();

            assert.equal(400, length);
            assert.equal(300, breadth);
        });

        it('should make a horizontal funnel as long as the chart is wide', () => {
            ['right', 'left'].forEach((direction) => {
                const { length, breadth } = getProjection(direction);

                assert.equal(300, length);
                assert.equal(400, breadth);
            });
        });

        it('should bulge curves toward the start of a funnel only when it flows up', () => {
            assert.equal(1, getProjection('down').curveDirection);
            assert.equal(1, getProjection('right').curveDirection);
            assert.equal(-1, getProjection('up').curveDirection);
            assert.equal(1, getProjection('left').curveDirection);
        });

        it('should throw an error for an unknown direction', () => {
            assert.throws(() => getProjection('sideways'), 'Unknown chart direction: sideways.');
        });
    });

    describe('projectPoint', () => {
        it('should map the cross axis to x and the flow axis to y by default', () => {
            assert.deepEqual({ x: 10, y: 20 }, getProjection().projectPoint(10, 20));
        });

        it('should mirror the flow axis when flowing up', () => {
            assert.deepEqual({ x: 10, y: 380 }, getProjection('up').projectPoint(10, 20));
        });

        it('should map the flow axis to x and the cross axis to y from the bottom when flowing right', () => {
            assert.deepEqual({ x: 20, y: 390 }, getProjection('right').projectPoint(10, 20));
        });

        it('should also mirror the flow axis when flowing left', () => {
            assert.deepEqual({ x: 280, y: 390 }, getProjection('left').projectPoint(10, 20));
        });
    });

    describe('projectPath', () => {
        it('should project each point while keeping its command', () => {
            const commands = [
                ['M', 0, 15],
                ['Q', 150, 25],
                ['', 300, 15],
            ];

            assert.deepEqual([
                ['M', 0, 385],
                ['Q', 150, 375],
                ['', 300, 385],
            ], getProjection('up').projectPath(commands));
        });
    });

    describe('projectBounds', () => {
        function getBounds(direction, flowBounds = {}) {
            return getProjection(direction).projectBounds({
                crossCenter: 150,
                start: 10,
                end: 90,
                getBreadthAt: () => 0,
                getFlowRangeAt: () => null,
                ...flowBounds,
            });
        }

        it('should map the cross center to x and the visible start and end to y', () => {
            const { centerX, top, bottom } = getBounds();

            assert.equal(150, centerX);
            assert.equal(10, top);
            assert.equal(90, bottom);
        });

        it('should measure the width at a y position as the breadth at that flow position', () => {
            const { getWidthAt } = getBounds('down', {
                getBreadthAt: (flow) => 300 - flow,
            });

            assert.equal(250, getWidthAt(50));
        });

        it('should put the visible end at the top when flowing up', () => {
            const { top, bottom, getWidthAt } = getBounds('up', {
                getBreadthAt: (flow) => 300 - flow,
            });

            assert.equal(310, top);
            assert.equal(390, bottom);
            assert.equal(250, getWidthAt(350));
        });

        it('should center a horizontal label along the flow, between the block\'s sides', () => {
            const { centerX, top, bottom } = getBounds('right', {
                crossCenter: 200,
                getBreadthAt: (flow) => (flow === 50 ? 120 : 0),
            });

            assert.equal(50, centerX);
            assert.equal(140, top);
            assert.equal(260, bottom);
        });

        it('should measure the width of a horizontal line by the nearer end of the block', () => {
            const { getWidthAt } = getBounds('right', {
                crossCenter: 200,
                getFlowRangeAt: (cross) => (cross === 300 ? { start: 20, end: 90 } : null),
            });

            // The line at y = 100 is at cross position 300, where the block starts 30 before the
            // middle and ends 40 after it
            assert.equal(60, getWidthAt(100));
            assert.equal(0, getWidthAt(50));
        });
    });
});
