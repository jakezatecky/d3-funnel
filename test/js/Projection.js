import { assert } from 'chai';

import Projection from '#js/Projection.js';

describe('Projection', () => {
    function getProjection() {
        return new Projection(300, 400);
    }

    describe('constructor', () => {
        it('should make the funnel as long as the chart is high and as broad as it is wide', () => {
            const { length, breadth } = getProjection();

            assert.equal(400, length);
            assert.equal(300, breadth);
        });
    });

    describe('projectPoint', () => {
        it('should map the cross axis to x and the flow axis to y', () => {
            assert.deepEqual({ x: 10, y: 20 }, getProjection().projectPoint(10, 20));
        });
    });

    describe('projectPath', () => {
        it('should project each point while keeping its command', () => {
            const commands = [
                ['M', 0, 15],
                ['Q', 150, 25],
                ['', 300, 15],
            ];

            assert.deepEqual(commands, getProjection().projectPath(commands));
        });
    });

    describe('projectBounds', () => {
        it('should map the cross center to x and the visible start and end to y', () => {
            const { centerX, top, bottom } = getProjection().projectBounds({
                crossCenter: 150,
                start: 10,
                end: 90,
                getBreadthAt: () => 0,
            });

            assert.equal(150, centerX);
            assert.equal(10, top);
            assert.equal(90, bottom);
        });

        it('should measure the width at a y position as the breadth at that flow position', () => {
            const { getWidthAt } = getProjection().projectBounds({
                crossCenter: 150,
                start: 10,
                end: 90,
                getBreadthAt: (flow) => 300 - flow,
            });

            assert.equal(250, getWidthAt(50));
        });
    });
});
