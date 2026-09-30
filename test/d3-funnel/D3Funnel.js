import { cloneDeep } from 'lodash';
import {
    range,
    select,
    selectAll,
    scaleOrdinal,
    schemeCategory10,
} from 'd3';
import { assert } from 'chai';
import sinon from 'sinon';

import D3Funnel from '../../src/d3-funnel/D3Funnel.js';

function getFunnel() {
    return new D3Funnel('#funnel');
}

function getSvg() {
    return select('#funnel').selectAll('svg');
}

function getSvgId() {
    return document.querySelector('#funnel svg').id;
}

function getBasicData() {
    return [{ label: 'Node', value: 1000 }];
}

function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function getCommandPoint(command) {
    const points = command.split(',');
    const y = points[1];

    let x = points[0];

    // Strip any letter in front of number
    if (isLetter(x[0])) {
        x = x.slice(1);
    }

    return {
        x: parseFloat(x),
        y: parseFloat(y),
    };
}

function getPathTopWidth(path) {
    const commands = path.attr('d').split(' ');

    return getCommandPoint(commands[1]).x - getCommandPoint(commands[0]).x;
}

function getPathBottomWidth(path) {
    const commands = path.attr('d').split(' ');

    return getCommandPoint(commands[2]).x - getCommandPoint(commands[3]).x;
}

function getPathHeight(path) {
    const commands = path.attr('d').split(' ');

    return getCommandPoint(commands[2]).y - getCommandPoint(commands[0]).y;
}

const defaults = cloneDeep(D3Funnel.defaults);

describe('D3Funnel', () => {
    beforeEach((done) => {
        // Reset any styles
        select('#funnel').attr('style', null);

        // Reset defaults
        D3Funnel.defaults = cloneDeep(defaults);

        // Clear out sandbox
        document.getElementById('sandbox').innerHTML = '';

        done();
    });

    describe('constructor', () => {
        it('should instantiate without error when a query string is provided', () => {
            new D3Funnel('#funnel'); // eslint-disable-line no-new
        });

        it('should instantiate without error when a DOM node is provided', () => {
            new D3Funnel(document.querySelector('#funnel')); // eslint-disable-line no-new
        });
    });

    describe('methods', () => {
        describe('draw', () => {
            it('should draw a chart on the identified target', () => {
                getFunnel().draw(getBasicData());

                assert.equal(1, getSvg().nodes().length);
            });

            it('should draw when no options are specified', () => {
                getFunnel().draw(getBasicData());

                assert.equal(1, getSvg().nodes().length);
            });

            it('should throw an error when the data is not an array', () => {
                const funnel = getFunnel();

                assert.throws(() => {
                    funnel.draw('Not array');
                }, Error, 'Data must be an array.');
            });

            it('should throw an error when the data array does not have an element', () => {
                const funnel = getFunnel();

                assert.throws(() => {
                    funnel.draw([]);
                }, Error, 'Data array must contain at least one element.');
            });

            it('should throw an error when the first data array element is not an object', () => {
                const funnel = getFunnel();

                assert.throws(() => {
                    funnel.draw(['Not array']);
                }, Error, 'Data array elements must be an object.');
            });

            it('should throw an error when given the legacy array format', () => {
                const funnel = getFunnel();

                assert.throws(() => {
                    funnel.draw([['Label', 100]]);
                }, Error, 'the legacy array format was removed in v3');
            });

            it('should throw an error when the first data array element does not have a value', () => {
                const funnel = getFunnel();

                assert.throws(() => {
                    funnel.draw([{ label: 'Only Label' }]);
                }, Error, 'Data array elements must contain a label and value.');
            });

            it('should draw as many blocks as there are elements', () => {
                getFunnel().draw([
                    { label: 'Node A', value: 1 },
                    { label: 'Node B', value: 2 },
                    { label: 'Node C', value: 3 },
                    { label: 'Node D', value: 4 },
                ]);

                assert.equal(4, getSvg().selectAll('path').nodes().length);
            });

            it('should pass any row-specified formatted values to the label formatter', () => {
                getFunnel().draw([
                    { label: 'Node A', value: 1, formattedValue: 'One' },
                    { label: 'Node B', value: 2 },
                    { label: 'Node C', value: 1, formattedValue: 'Three' },
                ]);

                const texts = getSvg().selectAll('text').nodes();

                assert.equal('Node A: One', select(texts[0]).text());
                assert.equal('Node B: 2', select(texts[1]).text());
                assert.equal('Node C: Three', select(texts[2]).text());
            });

            it('should hide the labels of any row specified', () => {
                getFunnel().draw([
                    { label: 'Node A', value: 1, hideLabel: true },
                    { label: 'Node B', value: 2 },
                    { label: 'Node C', value: 3, hideLabel: true },
                ]);

                const texts = getSvg().selectAll('text').nodes();

                assert.equal('Node B: 2', select(texts[0]).text());
                assert.equal(undefined, texts[1]);
            });

            it('should use colors assigned to a data element', () => {
                getFunnel().draw([
                    { label: 'Node A', value: 1, fillColor: '#111' },
                    { label: 'Node B', value: 2, fillColor: '#222' },
                    { label: 'Node C', value: 3 },
                    { label: 'Node D', value: 4, fillColor: '#444' },
                ]);

                const paths = getSvg().selectAll('path').nodes();
                const colorScale = scaleOrdinal(schemeCategory10).domain(range(0, 10));

                assert.equal('#111', select(paths[0]).attr('fill'));
                assert.equal('#222', select(paths[1]).attr('fill'));
                assert.equal(colorScale(2), select(paths[2]).attr('fill'));
                assert.equal('#444', select(paths[3]).attr('fill'));
            });

            it('should use label colors assigned to a data element', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, labelColor: '#111' },
                    { label: 'B', value: 2, labelColor: '#222' },
                    { label: 'C', value: 3 },
                    { label: 'D', value: 4, labelColor: '#444' },
                ]);

                const texts = getSvg().selectAll('text').nodes();

                assert.equal('#111', select(texts[0]).attr('fill'));
                assert.equal('#222', select(texts[1]).attr('fill'));
                assert.equal('#fff', select(texts[2]).attr('fill'));
                assert.equal('#444', select(texts[3]).attr('fill'));
            });

            it('should use label font sizes assigned to a data element', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, labelFontSize: '10px' },
                    { label: 'B', value: 2 },
                ]);

                const texts = getSvg().selectAll('text').nodes();

                assert.equal('10px', select(texts[0]).attr('font-size'));
                assert.equal('14px', select(texts[1]).attr('font-size'));
            });

            it('should use label font families assigned to a data element', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, labelFontFamily: 'serif' },
                    { label: 'B', value: 2 },
                ], {
                    label: { fontFamily: 'monospace' },
                });

                const texts = getSvg().selectAll('text').nodes();

                assert.equal('serif', select(texts[0]).attr('font-family'));
                assert.equal('monospace', select(texts[1]).attr('font-family'));
            });

            it('should scale line spacing with label font sizes assigned to a data element', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, labelFontSize: '30px' },
                    { label: 'B', value: 2 },
                ], {
                    label: { format: '{l}\n{v}', fontSize: '20px', lineHeight: 1 },
                });

                const dys = getSvg().selectAll('tspan').nodes().map((node) => (
                    parseFloat(select(node).attr('dy'))
                ));

                assert.deepEqual([-15, 30, -10, 20], dys);
            });

            it('should remove other elements from container', () => {
                const container = select('#funnel');
                const funnel = getFunnel();

                // Make sure the container has no children
                container.selectAll('*').remove();

                container.append('p');
                funnel.draw(getBasicData());

                // Expect funnel children count plus funnel itself
                const expected = getSvg().selectAll('*').size() + 1;
                const actual = container.selectAll('*').size();

                assert.equal(expected, actual);
            });

            it('should remove inner text from container', () => {
                const container = select('#funnel');
                const funnel = getFunnel();

                // Make sure the container has no text
                container.text();

                container.text('to be removed');
                funnel.draw(getBasicData());

                // Make sure the only text in container comes from the funnel
                assert.equal(getSvg().text(), container.text());
            });

            it('should assign a unique ID upon draw', () => {
                getFunnel().draw(getBasicData());

                const id = getSvgId();

                assert.isTrue(document.querySelectorAll(`#${id}`).length === 1);
            });
        });

        describe('drawLabel', () => {
            function getTwoBlockFunnel(options = {}) {
                const funnel = getFunnel();

                funnel.draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], options);

                return funnel;
            }

            function getTexts() {
                return getSvg().selectAll('text').nodes().map((node) => select(node));
            }

            it('should replace the existing label rather than add another', () => {
                getTwoBlockFunnel().drawLabel(0);

                assert.equal(2, getTexts().length);
            });

            it('should apply overrides to only the given block', () => {
                getTwoBlockFunnel().drawLabel(1, {
                    color: '#111',
                    fontSize: '20px',
                    fontFamily: 'serif',
                });

                const [first, second] = getTexts();

                assert.equal('#fff', first.attr('fill'));
                assert.equal('14px', first.attr('font-size'));
                assert.equal(null, first.attr('font-family'));
                assert.equal('#111', second.attr('fill'));
                assert.equal('20px', second.attr('font-size'));
                assert.equal('serif', second.attr('font-family'));
            });

            it('should restore the original label when called without overrides', () => {
                const funnel = getTwoBlockFunnel();

                funnel.drawLabel(0, { fontSize: '20px' });
                funnel.drawLabel(0);

                assert.equal('14px', getTexts()[0].attr('font-size'));
            });

            it('should space lines according to the overridden font size', () => {
                getTwoBlockFunnel({
                    label: { format: '{l}\n{v}', lineHeight: 1 },
                }).drawLabel(0, { fontSize: '30px' });

                const dys = getTexts()[0].selectAll('tspan').nodes().map((node) => (
                    parseFloat(select(node).attr('dy'))
                ));

                assert.deepEqual([-15, 30], dys);
            });

            it('should not change the shape of any block', () => {
                const funnel = getTwoBlockFunnel();
                const getShapes = () => getSvg().selectAll('path').nodes().map((node) => (
                    select(node).attr('d')
                ));
                const before = getShapes();

                funnel.drawLabel(0, { fontSize: '40px' });

                assert.deepEqual(before, getShapes());
            });

            it('should not draw labels that are hidden', () => {
                const funnel = getFunnel();

                funnel.draw([
                    { label: 'A', value: 1, hideLabel: true },
                    { label: 'B', value: 2 },
                ]);
                funnel.drawLabel(0, { fontSize: '20px' });

                assert.equal(1, getTexts().length);
                assert.equal('B: 2', getTexts()[0].text());
            });

            it('should do nothing for a block that has not been drawn yet', () => {
                getTwoBlockFunnel({ chart: { animation: { duration: 1000 } } }).drawLabel(1);

                assert.equal(1, getTexts().length);
            });

            it('should be usable to enlarge a label while the mouse is over its block', () => {
                const funnel = getFunnel();

                funnel.draw(getBasicData(), {
                    events: {
                        mouseover: {
                            block: (event, d) => funnel.drawLabel(d.index, { fontSize: '20px' }),
                        },
                        mouseout: {
                            block: (event, d) => funnel.drawLabel(d.index),
                        },
                    },
                });

                const path = select('#funnel path').node();

                path.dispatchEvent(new MouseEvent('mouseover'));
                assert.equal('20px', getTexts()[0].attr('font-size'));

                path.dispatchEvent(new MouseEvent('mouseout'));
                assert.equal('14px', getTexts()[0].attr('font-size'));
            });
        });

        describe('destroy', () => {
            it('should remove a drawn SVG element', () => {
                const funnel = getFunnel();

                funnel.draw(getBasicData());
                funnel.destroy();

                assert.equal(0, getSvg().nodes().length);
            });

            it('should remove the tooltip and any other content of the container', () => {
                const funnel = getFunnel();

                funnel.draw(getBasicData(), {
                    tooltip: {
                        enabled: true,
                    },
                });
                select('#funnel path').node().dispatchEvent(new MouseEvent('mousemove'));
                select('#funnel').append('span').text('Other content');
                funnel.destroy();

                assert.equal(0, document.querySelector('#funnel').childNodes.length);
            });
        });
    });

    describe('defaults', () => {
        it('should affect all default options', () => {
            D3Funnel.defaults.label.color = '#777';

            getFunnel().draw(getBasicData());

            assert.isTrue(select('#funnel text').attr('fill').indexOf('#777') > -1);
        });
    });

    describe('options', () => {
        describe('chart.width/height', () => {
            it('should default to the container\'s dimensions', () => {
                ['width', 'height'].forEach((direction) => {
                    select('#funnel').style(direction, '250px');

                    getFunnel().draw(getBasicData());

                    assert.equal(250, getSvg().node().getBBox()[direction]);
                });
            });

            it('should default to the library defaults if the container dimensions are zero', () => {
                document.querySelector('#funnel').style.width = '0px';
                document.querySelector('#funnel').style.height = '0px';

                getFunnel().draw(getBasicData());

                assert.equal(350, getSvg().node().getBBox().width);
                assert.equal(400, getSvg().node().getBBox().height);
            });

            it('should not carry a previous container\'s dimensions into the library defaults', () => {
                select('#funnel').style('width', '250px').style('height', '250px');

                getFunnel().draw(getBasicData());

                select('#funnel').style('width', '0px').style('height', '0px');

                getFunnel().draw(getBasicData());

                assert.equal(350, D3Funnel.defaults.chart.width);
                assert.equal(400, D3Funnel.defaults.chart.height);
                assert.equal(350, getSvg().node().getBBox().width);
                assert.equal(400, getSvg().node().getBBox().height);
            });

            it('should set the funnel\'s width/height to the specified amount', () => {
                ['width', 'height'].forEach((direction) => {
                    getFunnel().draw(getBasicData(), {
                        chart: {
                            [direction]: 200,
                        },
                    });

                    assert.equal(200, getSvg().node().getBBox()[direction]);
                });
            });

            it('should set the funnel\'s percent width/height to the specified amount', () => {
                ['width', 'height'].forEach((direction) => {
                    select('#funnel').style(direction, '200px');

                    getFunnel().draw(getBasicData(), {
                        chart: {
                            [direction]: '75%',
                        },
                    });

                    assert.equal(150, getSvg().node().getBBox()[direction]);
                });
            });
        });

        describe('chart.height', () => {
            it('should default to the container\'s height', () => {
                select('#funnel').style('height', '250px');

                getFunnel().draw(getBasicData());

                assert.equal(250, getSvg().node().getBBox().height);
            });

            it('should set the funnel\'s height to the specified amount', () => {
                getFunnel().draw(getBasicData(), {
                    chart: {
                        height: 200,
                    },
                });

                assert.equal(200, getSvg().node().getBBox().height);
            });

            it('should set the funnel\'s percentage height to the specified amount', () => {
                select('#funnel').style('height', '300px');

                getFunnel().draw(getBasicData(), {
                    chart: {
                        height: '50%',
                    },
                });

                assert.equal(150, getSvg().node().getBBox().height);
            });
        });

        describe('chart.neckWidth', () => {
            it('should set the bottom tip width to the specified percentage', () => {
                getFunnel().draw(getBasicData(), {
                    chart: {
                        width: 200,
                        neckWidth: 1 / 2,
                    },
                });

                assert.equal(100, getPathBottomWidth(select('path')));
            });
        });

        describe('chart.pinchedBlocks', () => {
            it('should set the last n number of blocks to have the width of chart.neckWidth', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                    { label: 'C', value: 3 },
                ], {
                    chart: {
                        width: 450,
                        neckWidth: 1 / 3,
                        pinchedBlocks: 2,
                    },
                });

                const paths = selectAll('path').nodes();

                assert.equal(150, paths[1].getBBox().width);
                assert.equal(150, paths[2].getBBox().width);
            });

            it('should maintain chart.neckWidth when combined with block.minHeight', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                    { label: 'C', value: 3 },
                ], {
                    chart: {
                        width: 450,
                        height: 100,
                        neckWidth: 1 / 3,
                        pinchedBlocks: 1,
                    },
                    block: {
                        proportionalHeight: true,
                        minHeight: 20,
                    },
                });

                const paths = selectAll('path').nodes();

                assert.equal(150, paths[2].getBBox().width);
            });

            it('should maintain chart.neckWidth when combined with block.proportionalHeight and curve.enabled', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                    { label: 'C', value: 3 },
                    { label: 'D', value: 4 },
                ], {
                    chart: {
                        width: 320,
                        height: 400,
                        neckWidth: 3 / 8,
                        pinchedBlocks: 1,
                        curve: {
                            enabled: true,
                        },
                    },
                    block: {
                        proportionalHeight: true,
                    },
                });

                const paths = selectAll('path').nodes();

                assert.equal(120, paths[4].getBBox().width);
            });
        });

        describe('chart.inverted', () => {
            it('should draw the chart in a top-to-bottom arrangement by default', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    chart: {
                        width: 200,
                        neckWidth: 1 / 2,
                    },
                });

                const paths = selectAll('path').nodes();

                assert.equal(200, getPathTopWidth(select(paths[0])));
                assert.equal(100, getPathBottomWidth(select(paths[1])));
            });

            it('should draw the chart in a bottom-to-top arrangement when true', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    chart: {
                        width: 200,
                        neckWidth: 1 / 2,
                        inverted: true,
                    },
                });

                const paths = selectAll('path').nodes();

                assert.equal(100, getPathTopWidth(select(paths[0])));
                assert.equal(200, getPathBottomWidth(select(paths[1])));
            });
        });

        describe('chart.curve.enabled', () => {
            it('should create an additional path on top of the trapezoids', () => {
                getFunnel().draw(getBasicData(), {
                    chart: {
                        curve: {
                            enabled: true,
                        },
                    },
                });

                assert.equal(2, selectAll('#funnel path').nodes().length);
            });

            it('should create a quadratic Bezier curve on each path', () => {
                getFunnel().draw(getBasicData(), {
                    chart: {
                        curve: {
                            enabled: true,
                        },
                    },
                });

                const paths = selectAll('#funnel path').nodes();
                const quadraticPaths = paths.filter((path) => select(path).attr('d').indexOf('Q') > -1);

                assert.equal(paths.length, quadraticPaths.length);
            });

            function drawCurved(block = {}) {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 3 },
                ], {
                    chart: {
                        width: 200,
                        height: 200,
                        neckWidth: 1 / 4,
                        curve: { enabled: true, depth: 5 },
                    },
                    block,
                });

                return selectAll('#funnel path').nodes().map((node) => (
                    select(node).attr('d').split(' ').map(getCommandPoint)
                ));
            }

            it('should curve each edge in proportion to its width', () => {
                const [, first, second] = drawCurved();

                // A full-width edge dips by the curve depth, so its control
                // point is offset by twice the curve depth
                assert.closeTo(10, first[1].y - first[0].y, 0.0001);

                // The 50px bottom edge is a quarter of the width
                assert.closeTo(2.5, second[5].y - second[3].y, 0.0001);
            });

            it('should extend the bottom of a block beneath the next block', () => {
                const [, first, second] = drawCurved();

                // Sharing the exact same edge would leave an anti-aliased seam
                assert.isAbove(first[5].y, second[1].y);
            });

            it('should curve separated blocks such that they would stack without the gap', () => {
                drawCurved({ gap: 10 });

                const [first, second] = selectAll('#funnel g path').nodes().map((node) => (
                    select(node).attr('d').split(' ').map(getCommandPoint)
                ));

                // The bottom of the first block is not extended beneath the
                // second; both have the same depth relative to their widths
                const bottomRatio = (first[5].y - first[3].y) / (first[3].x - first[6].x);
                const topRatio = (second[1].y - second[0].y) / (second[2].x - second[0].x);

                assert.closeTo(bottomRatio, topRatio, 0.0001);
            });

            it('should extend the front of the top oval beneath the first block', () => {
                const [oval, first] = drawCurved();

                assert.isAbove(oval[1].y, first[1].y);
            });

            it('should fill the height of the chart exactly', () => {
                const [oval, , second] = drawCurved();

                // The back of the top oval peaks at the top of the chart
                assert.closeTo(0, (oval[3].y + oval[4].y) / 2, 0.0001);

                // The bottom edge dips to the bottom of the chart
                assert.closeTo(200, (second[3].y + second[5].y) / 2, 0.0001);
            });

            it('should maintain chart.neckWidth when combined with block.proportionalHeight', () => {
                const [, , second] = drawCurved({ proportionalHeight: true });

                assert.closeTo(50, second[3].x - second[6].x, 0.0001);
            });
        });

        describe('block.proportionalHeight', () => {
            it('should use equal heights when false', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    chart: {
                        height: 300,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(150, getPathHeight(select(paths[0])));
                assert.equal(150, getPathHeight(select(paths[1])));
            });

            it('should use proportional heights when true', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    chart: {
                        height: 300,
                    },
                    block: {
                        proportionalHeight: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(100, parseInt(getPathHeight(select(paths[0])), 10));
                assert.equal(200, parseInt(getPathHeight(select(paths[1])), 10));
            });

            it('should not have NaN in the last path when neckWidth is equal to 0%', () => {
                // A very specific cooked-up example that could trigger NaN
                getFunnel().draw([
                    { label: 'A', value: 120 },
                    { label: 'B', value: 40 },
                    { label: 'C', value: 20 },
                    { label: 'D', value: 15 },
                ], {
                    chart: {
                        height: 300,
                        neckWidth: 0,
                    },
                    block: {
                        proportionalHeight: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(-1, select(paths[3]).attr('d').indexOf('NaN'));
            });

            it('should not error when neckWidth is equal to 100%', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    chart: {
                        height: 300,
                        neckWidth: 1,
                    },
                    block: {
                        proportionalHeight: true,
                    },
                });
            });

            it('should not generate NaN or Infinite values when zero', () => {
                getFunnel().draw(getBasicData(), {
                    chart: {
                        height: 0,
                    },
                    block: {
                        proportionalHeight: true,
                    },
                });

                selectAll('path').nodes().forEach((node) => {
                    const definition = String(select(node).attr('d'));

                    assert.equal(false, definition.indexOf('NaN') > -1 || definition.indexOf('Infinity') > -1);
                });
            });

            it('should give all blocks equal height if the sum of values is zero', () => {
                getFunnel().draw([
                    { label: 'A', value: 0 },
                    { label: 'B', value: 0 },
                ], {
                    chart: {
                        height: 300,
                    },
                    block: {
                        proportionalHeight: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(150, getPathHeight(select(paths[0])));
                assert.equal(150, getPathHeight(select(paths[1])));
            });
        });

        describe('block.proportionalWidth', () => {
            it('should give each block top width relative to its value', () => {
                getFunnel().draw([
                    { label: 'A', value: 100 },
                    { label: 'B', value: 55 },
                    { label: 'C', value: 42 },
                    { label: 'D', value: 74 },
                ], {
                    chart: {
                        width: 100,
                    },
                    block: {
                        proportionalWidth: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(parseFloat(getPathTopWidth(select(paths[0]))), 100);
                assert.equal(parseFloat(getPathTopWidth(select(paths[1]))), 55);
                assert.equal(parseFloat(getPathTopWidth(select(paths[2]))), 42);
                assert.equal(parseFloat(getPathTopWidth(select(paths[3]))), 74);
            });

            it('should make the last block top width equal to bottom width', () => {
                getFunnel().draw([
                    { label: 'A', value: 100 },
                    { label: 'B', value: 52 },
                    { label: 'C', value: 42 },
                    { label: 'D', value: 74 },
                ], {
                    chart: {
                        width: 100,
                    },
                    block: {
                        proportionalWidth: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(parseFloat(getPathTopWidth(select(paths[3]))), 74);
                assert.equal(parseFloat(getPathBottomWidth(select(paths[3]))), 74);
            });

            it('should use neckWidth value when false', () => {
                getFunnel().draw([
                    { label: 'A', value: 100 },
                    { label: 'B', value: 90 },
                ], {
                    chart: {
                        width: 100,
                        neckWidth: 0.4,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(parseFloat(getPathTopWidth(select(paths[0]))), 100);
                assert.equal(parseFloat(getPathBottomWidth(select(paths[1]))), 40);
            });
        });

        describe('block.barOverlay', () => {
            it('should draw value overlay within each path', () => {
                getFunnel().draw([
                    { label: 'A', value: 10 },
                    { label: 'B', value: 20 },
                ], {
                    block: {
                        barOverlay: {
                            enabled: true,
                        },
                    },
                });

                // draw 2 path for each data point
                assert.equal(4, selectAll('#funnel path').nodes().length);
            });

            it('should mark the background and foreground paths with a data attribute', () => {
                getFunnel().draw(getBasicData(), {
                    block: {
                        barOverlay: {
                            enabled: true,
                        },
                    },
                });

                const [background, overlay] = selectAll('#funnel path').nodes();

                assert.equal('background', background.getAttribute('data-path-type'));
                assert.equal('foreground', overlay.getAttribute('data-path-type'));
            });

            it('should draw value overlay with overridden total value', () => {
                getFunnel().draw([
                    { label: 'A', value: 10 },
                    { label: 'B', value: 20 },
                ], {
                    chart: {
                        totalValue: 100,
                    },
                    block: {
                        barOverlay: {
                            enabled: true,
                        },
                    },
                });

                const paths = selectAll('path').nodes();

                const APathFullWidth = getPathTopWidth(select(paths[0]));
                const APathOverlayWidth = getPathTopWidth(select(paths[1]));
                const BPathFullWidth = getPathTopWidth(select(paths[2]));
                const BPathOverlayWidth = getPathTopWidth(select(paths[3]));

                assert.equal(10, Math.round((APathOverlayWidth / APathFullWidth) * 100));
                assert.equal(20, Math.round((BPathOverlayWidth / BPathFullWidth) * 100));
            });

            it('should size the overlay of an indented block by its ratio', () => {
                getFunnel().draw([
                    { label: 'A', value: 10 },
                    { label: 'B', value: 90 },
                ], {
                    chart: {
                        width: 300,
                    },
                    block: {
                        barOverlay: {
                            enabled: true,
                        },
                    },
                });

                const paths = selectAll('path').nodes();
                const fullPath = select(paths[2]);
                const overlayPath = select(paths[3]);

                const topRatio = getPathTopWidth(overlayPath) / getPathTopWidth(fullPath);
                const bottomRatio = getPathBottomWidth(overlayPath) / getPathBottomWidth(fullPath);

                assert.equal(90, Math.round(topRatio * 100));
                assert.equal(90, Math.round(bottomRatio * 100));
            });

            it('should not extend the overlay past its block', () => {
                getFunnel().draw([
                    { label: 'A', value: 10 },
                    { label: 'B', value: 20 },
                ], {
                    chart: {
                        width: 300,
                        totalValue: 10,
                    },
                    block: {
                        barOverlay: {
                            enabled: true,
                        },
                    },
                });

                const paths = selectAll('path').nodes();
                const fullPath = select(paths[2]);
                const overlayPath = select(paths[3]);

                assert.equal(getPathTopWidth(fullPath), getPathTopWidth(overlayPath));
                assert.equal(getPathBottomWidth(fullPath), getPathBottomWidth(overlayPath));
            });

            it('should lighten the block behind its overlay by `block.barOverlay.shade`', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, fillColor: '#808080' },
                ], {
                    block: {
                        barOverlay: {
                            enabled: true,
                            shade: 0.5,
                        },
                    },
                });

                // #808080 * 1/2 => #c0c0c0
                assert.equal('#c0c0c0', select('#funnel path').attr('fill'));
            });
        });

        describe('block.fill.colors', () => {
            it('should use a function\'s return value', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    block: {
                        fill: {
                            colors: (index) => {
                                if (index === 0) {
                                    return '#111';
                                }

                                return '#222';
                            },
                        },
                    },
                });

                const paths = getSvg().selectAll('path').nodes();

                assert.equal('#111', select(paths[0]).attr('fill'));
                assert.equal('#222', select(paths[1]).attr('fill'));
            });

            it('should use an array\'s return value', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    block: {
                        fill: {
                            colors: ['#111', '#222'],
                        },
                    },
                });

                const paths = getSvg().selectAll('path').nodes();

                assert.equal('#111', select(paths[0]).attr('fill'));
                assert.equal('#222', select(paths[1]).attr('fill'));
            });
        });

        describe('block.fill.type', () => {
            it('should create gradients when set to \'gradient\'', () => {
                getFunnel().draw(getBasicData(), {
                    block: {
                        fill: {
                            type: 'gradient',
                        },
                    },
                });

                const id = getSvgId();

                // Cannot try to re-select the camelCased linearGradient element
                // due to a Webkit bug in the current PhantomJS; workaround is
                // to select the known ID of the linearGradient element
                // https://bugs.webkit.org/show_bug.cgi?id=83438
                assert.equal(1, selectAll(`#funnel defs #${id}-gradient-0`).nodes().length);

                assert.equal(`url(#${id}-gradient-0)`, select('#funnel path').attr('fill'));
            });

            it('should shade the edges of gradients by `block.fill.gradientShade`', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, fillColor: '#808080' },
                ], {
                    block: {
                        fill: {
                            type: 'gradient',
                            gradientShade: -0.5,
                        },
                    },
                });

                const stops = selectAll(`#funnel defs #${getSvgId()}-gradient-0 stop`).nodes();

                // #808080 * -1/2 => #404040
                assert.equal('stop-color: #404040', stops[0].getAttribute('style'));
                assert.equal('stop-color: #808080', stops[1].getAttribute('style'));
            });

            it('should use solid fill when not set to \'gradient\'', () => {
                getFunnel().draw(getBasicData());

                // Check for valid hex string
                assert.isTrue(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(
                    select('#funnel path').attr('fill'),
                ));
            });
        });

        describe('block.minHeight', () => {
            it('should give each block the minimum height specified', () => {
                getFunnel().draw([
                    { label: 'A', value: 299 },
                    { label: 'B', value: 1 },
                ], {
                    chart: {
                        height: 300,
                    },
                    block: {
                        proportionalHeight: true,
                        minHeight: 10,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.isAbove(parseFloat(getPathHeight(select(paths[0]))), 10);
                assert.isAbove(parseFloat(getPathHeight(select(paths[1]))), 10);
            });

            it('should decrease the height of blocks above the minimum', () => {
                getFunnel().draw([
                    { label: 'A', value: 299 },
                    { label: 'B', value: 1 },
                ], {
                    chart: {
                        height: 300,
                    },
                    block: {
                        proportionalHeight: true,
                        minHeight: 10,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.isBelow(parseFloat(getPathHeight(select(paths[0]))), 290);
            });
        });

        describe('block.gap', () => {
            function getBlockPaths(options) {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 1 },
                ], {
                    chart: { width: 200, height: 200, neckWidth: 1 / 2 },
                    ...options,
                });

                return selectAll('#funnel g path').nodes().map((node) => select(node));
            }

            function getPoints(path) {
                return path.attr('d').split(' ').map(getCommandPoint);
            }

            it('should leave the specified amount of space between blocks', () => {
                const [first, second] = getBlockPaths({ block: { gap: 10 } }).map(getPoints);

                assert.equal(95, first[2].y);
                assert.equal(105, second[0].y);
            });

            it('should not move the outer edges of the funnel', () => {
                const [first, second] = getBlockPaths({ block: { gap: 10 } }).map(getPoints);

                assert.equal(0, first[0].y);
                assert.equal(200, getPathTopWidth(select('#funnel g path')));
                assert.equal(200, second[2].y);
                assert.equal(100, second[2].x - second[3].x);
            });

            it('should keep the sides of separated blocks along the funnel outline', () => {
                const [first, second] = getBlockPaths({ block: { gap: 10 } }).map(getPoints);

                // The left side runs from (0, 0) to (50, 200)
                assert.closeTo(95 / 4, first[3].x, 0.0001);
                assert.closeTo(105 / 4, second[0].x, 0.0001);
            });

            it('should never shrink a block below zero height', () => {
                getBlockPaths({ block: { gap: 1000 } }).forEach((path) => {
                    assert.isAtLeast(getPathHeight(path), 0);
                });
            });

            it('should draw a top oval for each block of a curved funnel', () => {
                getBlockPaths({
                    chart: { width: 200, height: 200, curve: { enabled: true } },
                    block: { gap: 10 },
                });

                // One oval for each of the two blocks, plus the two blocks
                assert.equal(4, selectAll('#funnel path').size());
            });

            it('should only draw a single top oval for a curved funnel without a gap', () => {
                getBlockPaths({
                    chart: { width: 200, height: 200, curve: { enabled: true } },
                });

                assert.equal(3, selectAll('#funnel path').size());
            });
        });

        describe('block.highlight', () => {
            it('should change block color on hover', () => {
                const event = new MouseEvent('mouseover');

                getFunnel().draw([
                    { label: 'A', value: 1, fillColor: '#fff' },
                ], {
                    block: {
                        highlight: {
                            enabled: true,
                        },
                    },
                });

                select('#funnel path').node().dispatchEvent(event);

                // #fff * -1/5 => #cccccc
                assert.equal('#cccccc', select('#funnel path').attr('fill'));
            });

            it('should shade and restore both paths of a block with an overlay', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, fillColor: '#808080' },
                ], {
                    block: {
                        barOverlay: {
                            enabled: true,
                        },
                        highlight: {
                            enabled: true,
                        },
                    },
                });

                const [background, overlay] = selectAll('#funnel path').nodes();

                overlay.dispatchEvent(new MouseEvent('mouseover'));

                // Each path is shaded from its resting color:
                // #a6a6a6 * -1/5 => #858585; #808080 * -1/5 => #666666
                assert.equal('#858585', background.getAttribute('fill'));
                assert.equal('#666666', overlay.getAttribute('fill'));

                overlay.dispatchEvent(new MouseEvent('mouseout'));

                // #808080 * 3/10 => #a6a6a6
                assert.equal('#a6a6a6', background.getAttribute('fill'));
                assert.equal('#808080', overlay.getAttribute('fill'));
            });

            it('should shade highlighted paths by the configured amount', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, fillColor: '#808080' },
                ], {
                    block: {
                        barOverlay: {
                            enabled: true,
                        },
                        highlight: {
                            enabled: true,
                            shade: -0.25,
                        },
                    },
                });

                const [background, overlay] = selectAll('#funnel path').nodes();

                overlay.dispatchEvent(new MouseEvent('mouseover'));

                // #a6a6a6 * -1/4 => #7d7d7d; #808080 * -1/4 => #606060
                assert.equal('#7d7d7d', background.getAttribute('fill'));
                assert.equal('#606060', overlay.getAttribute('fill'));
            });

            it('should shade and restore gradients rather than replace them', () => {
                getFunnel().draw([
                    { label: 'A', value: 1, fillColor: '#808080' },
                ], {
                    block: {
                        fill: {
                            type: 'gradient',
                        },
                        highlight: {
                            enabled: true,
                        },
                    },
                });

                const id = getSvgId();
                const path = select('#funnel path').node();

                path.dispatchEvent(new MouseEvent('mouseover'));

                assert.equal(`url(#${id}-gradient-0-highlight)`, path.getAttribute('fill'));

                // Edge: #666666 * -1/5 => #525252; center: #808080 * -1/5 => #666666
                const stops = selectAll(`#funnel defs #${id}-gradient-0-highlight stop`).nodes();
                assert.equal('stop-color: #525252', stops[0].getAttribute('style'));
                assert.equal('stop-color: #666666', stops[1].getAttribute('style'));

                path.dispatchEvent(new MouseEvent('mouseout'));

                assert.equal(`url(#${id}-gradient-0)`, path.getAttribute('fill'));
            });

            it('should not define highlighted gradients when highlighting is disabled', () => {
                getFunnel().draw(getBasicData(), {
                    block: {
                        fill: {
                            type: 'gradient',
                        },
                    },
                });

                assert.equal(0, selectAll(`#funnel defs #${getSvgId()}-gradient-0-highlight`).size());
            });
        });

        describe('label.enabled', () => {
            it('should render block labels when set to true', () => {
                getFunnel().draw(getBasicData(), {
                    label: { enabled: true },
                });

                assert.equal(1, selectAll('#funnel text').size());
            });

            it('should not render block labels when set to false', () => {
                getFunnel().draw(getBasicData(), {
                    label: { enabled: false },
                });

                assert.equal(0, selectAll('#funnel text').size());
            });
        });

        describe('label.fontFamily', () => {
            it('should set the label\'s font size to the specified amount', () => {
                getFunnel().draw(getBasicData(), {
                    label: {
                        fontFamily: 'Open Sans',
                    },
                });

                assert.equal('Open Sans', select('#funnel text').attr('font-family'));
            });
        });

        describe('label.fontSize', () => {
            it('should set the label\'s font size to the specified amount', () => {
                getFunnel().draw(getBasicData(), {
                    label: {
                        fontSize: '16px',
                    },
                });

                assert.equal('16px', select('#funnel text').attr('font-size'));
            });
        });

        describe('label.lineHeight', () => {
            function getLineDys(label) {
                getFunnel().draw(getBasicData(), {
                    chart: { height: 200 },
                    label: { format: '{l}\n{v}', ...label },
                });

                return selectAll('#funnel text tspan').nodes().map((node) => (
                    parseFloat(select(node).attr('dy'))
                ));
            }

            it('should space lines at 1.4 times the font size by default', () => {
                const [first, second] = getLineDys({ fontSize: '20px' });

                assert.closeTo(first, -14, 0.001);
                assert.closeTo(second, 28, 0.001);
            });

            it('should space lines at the specified multiple of the font size', () => {
                assert.deepEqual([-15, 30], getLineDys({ fontSize: '20px', lineHeight: 1.5 }));
            });

            it('should scale line spacing with the font size', () => {
                assert.deepEqual([-15, 30], getLineDys({ fontSize: '30px', lineHeight: 1 }));
            });

            it('should resolve relative font sizes', () => {
                select('#funnel').style('font-size', '10px');

                assert.deepEqual([-10, 20], getLineDys({ fontSize: '2em', lineHeight: 1 }));
            });
        });

        describe('label.color', () => {
            it('should set the label\'s fill color to the specified color', () => {
                getFunnel().draw(getBasicData(), {
                    label: {
                        color: '#777',
                    },
                });

                assert.isTrue(select('#funnel text').attr('fill').indexOf('#777') > -1);
            });
        });

        describe('label.format', () => {
            it('should parse a string template', () => {
                getFunnel().draw(getBasicData(), {
                    label: {
                        format: '{l} {v} {f}',
                    },
                });

                assert.equal('Node 1000 1,000', select('#funnel text').text());
            });

            it('should create split multiple lines into multiple tspans', () => {
                getFunnel().draw(getBasicData(), {
                    label: {
                        format: '{l}\n{v}',
                    },
                });

                const tspans = selectAll('#funnel text tspan').nodes();

                assert.equal('Node', select(tspans[0]).text());
                assert.equal('1000', select(tspans[1]).text());
            });

            it('should create position multiple lines in a vertically-centered manner', () => {
                getFunnel().draw(getBasicData(), {
                    chart: {
                        height: 200,
                    },
                    label: {
                        format: '{l}\n{v}\n{f}',
                        fontSize: '20px',
                        lineHeight: 1,
                    },
                });

                const tspans = selectAll('#funnel text tspan').nodes();

                assert.equal(-20, select(tspans[0]).attr('dy'));
                assert.equal(20, select(tspans[1]).attr('dy'));
                assert.equal(20, select(tspans[2]).attr('dy'));
            });

            it('should pass values to a supplied function', () => {
                getFunnel().draw(getBasicData(), {
                    label: {
                        format: (label, value, formattedValue) => `${label}/${value}/${formattedValue}`,
                    },
                });

                assert.equal('Node/1000/null', select('#funnel text').text());
            });
        });

        describe('label.verticalAlign', () => {
            function getLabelYs(verticalAlign, format = '{l}') {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 1 },
                ], {
                    chart: { height: 200 },
                    label: {
                        format,
                        verticalAlign,
                        fontSize: '20px',
                        lineHeight: 1,
                    },
                });

                return selectAll('#funnel text').nodes().map((node) => (
                    parseFloat(select(node).attr('y'))
                ));
            }

            it('should vertically center labels by default', () => {
                assert.deepEqual([50, 150], getLabelYs(undefined));
            });

            it('should align labels to the top of their blocks when set to "top"', () => {
                // Top edge + 5px padding + half of a 20px line
                assert.deepEqual([15, 115], getLabelYs('top'));
            });

            it('should align labels to the bottom of their blocks when set to "bottom"', () => {
                // Bottom edge - 5px padding - half of a 20px line
                assert.deepEqual([85, 185], getLabelYs('bottom'));
            });

            it('should account for the number of lines when aligning to the top', () => {
                // Top edge + 5px padding + half of two 20px lines
                assert.deepEqual([25, 125], getLabelYs('top', '{l}\n{v}'));
            });

            it('should account for the number of lines when aligning to the bottom', () => {
                // Bottom edge - 5px padding - half of two 20px lines
                assert.deepEqual([75, 175], getLabelYs('bottom', '{l}\n{v}'));
            });
        });

        describe('label.padding', () => {
            it('should set the space between a label and the edge of its block', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 1 },
                ], {
                    chart: { height: 200 },
                    label: {
                        verticalAlign: 'top',
                        fontSize: '20px',
                        lineHeight: 1,
                        padding: 10,
                    },
                });

                const ys = selectAll('#funnel text').nodes().map((node) => (
                    parseFloat(select(node).attr('y'))
                ));

                // Top edge + 10px padding + half of a 20px line
                assert.deepEqual([20, 120], ys);
            });
        });

        describe('label.overflow', () => {
            const longLabel = 'A label that is much too long to fit within its block';

            function drawLabel(label, options = {}) {
                getFunnel().draw([{ label, value: 1 }], {
                    chart: { width: 200, height: 100, neckWidth: 1 / 2 },
                    ...options,
                    label: { format: '{l}', ...options.label },
                });

                return selectAll('#funnel text tspan').nodes();
            }

            it('should leave long labels intact by default', () => {
                const [tspan] = drawLabel(longLabel);

                assert.equal(longLabel, tspan.textContent);
            });

            it('should truncate long labels with an ellipsis when set to \'ellipsis\'', () => {
                const [tspan] = drawLabel(longLabel, { label: { overflow: 'ellipsis' } });

                assert.notEqual(longLabel, tspan.textContent);
                assert.isTrue(tspan.textContent.endsWith('\u2026'));
                assert.isTrue(longLabel.startsWith(tspan.textContent.slice(0, -1)));
            });

            it('should fit truncated labels within the narrowest part of their line', () => {
                const [tspan] = drawLabel(longLabel, { label: { overflow: 'ellipsis' } });

                // The block narrows from 200px to 100px over 100px of height;
                // the line spans y = 40 to 60, where the block is 140px wide
                // at its narrowest, minus 5px padding on each side
                assert.isAtMost(tspan.getComputedTextLength(), 130);
            });

            it('should not truncate labels that already fit', () => {
                const [tspan] = drawLabel('Short', { label: { overflow: 'ellipsis' } });

                assert.equal('Short', tspan.textContent);
            });

            it('should truncate each line of a label separately', () => {
                const [first, second] = drawLabel(longLabel, {
                    label: { overflow: 'ellipsis', format: '{l}\nShort' },
                });

                assert.isTrue(first.textContent.endsWith('\u2026'));
                assert.equal('Short', second.textContent);
            });

            it('should hide the label when not even the ellipsis fits', () => {
                const [tspan] = drawLabel(longLabel, {
                    chart: { width: 10, height: 100 },
                    label: { overflow: 'ellipsis' },
                });

                assert.equal('', tspan.textContent);
            });
        });

        describe('tooltip.enabled', () => {
            it('should render a simple tooltip box when hovering over a block', () => {
                const event = new MouseEvent('mousemove');

                getFunnel().draw(getBasicData(), {
                    tooltip: {
                        enabled: true,
                    },
                });

                select('#funnel path').node().dispatchEvent(event);

                assert.notEqual(null, select('#funnel .d3-funnel-tooltip').node());
            });

            it('should hide the tooltip on mouseout', () => {
                const mouseMove = new MouseEvent('mousemove');
                const mouseOut = new MouseEvent('mouseout');

                getFunnel().draw(getBasicData(), {
                    tooltip: {
                        enabled: true,
                    },
                });

                select('#funnel path').node().dispatchEvent(mouseMove);
                select('#funnel path').node().dispatchEvent(mouseOut);

                assert.equal('none', select('#funnel .d3-funnel-tooltip').style('display'));
            });

            it('should render a tooltip after the chart is redrawn mid-hover', () => {
                const mouseMove = new MouseEvent('mousemove');
                const mouseOut = new MouseEvent('mouseout');
                const funnel = getFunnel();
                const options = {
                    tooltip: {
                        enabled: true,
                    },
                };

                funnel.draw(getBasicData(), options);
                select('#funnel path').node().dispatchEvent(mouseMove);

                funnel.draw(getBasicData(), options);
                select('#funnel path').node().dispatchEvent(mouseMove);

                assert.equal(1, selectAll('#funnel .d3-funnel-tooltip').size());
                assert.equal('inline-block', select('#funnel .d3-funnel-tooltip').style('display'));

                select('#funnel path').node().dispatchEvent(mouseOut);

                assert.equal('none', select('#funnel .d3-funnel-tooltip').style('display'));
            });

            it('should reuse one tooltip, positioned at once, when moving between blocks', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 1 },
                ], {
                    chart: {
                        width: 300,
                        height: 400,
                    },
                    tooltip: {
                        enabled: true,
                    },
                });

                const [first, second] = selectAll('#funnel path').nodes();

                first.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150 }));
                first.dispatchEvent(new MouseEvent('mouseout'));
                second.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 300 }));

                const rect = document.querySelector('#funnel .d3-funnel-tooltip').getBoundingClientRect();

                assert.equal(1, selectAll('#funnel .d3-funnel-tooltip').size());
                assert.closeTo(rect.left + (rect.width / 2), 150, 0.5);
                assert.closeTo(rect.bottom, 295, 0.5);
            });
        });

        describe('tooltip.format', () => {
            it('should render tooltips according to the format provided', () => {
                const event = new MouseEvent('mousemove');

                getFunnel().draw(getBasicData(), {
                    tooltip: {
                        enabled: true,
                        format: '{l} - {v}',
                    },
                });

                select('#funnel path').node().dispatchEvent(event);

                assert.equal('Node - 1000', select('#funnel .d3-funnel-tooltip').text());
            });
        });

        describe('tooltip.style', () => {
            function showTooltip(style = {}) {
                getFunnel().draw([
                    { label: 'A', value: 1, fillColor: '#808080' },
                ], {
                    tooltip: {
                        enabled: true,
                        style,
                    },
                });
                select('#funnel path').node().dispatchEvent(new MouseEvent('mousemove'));

                return document.querySelector('#funnel .d3-funnel-tooltip');
            }

            it('should outline the tooltip in the color of its block by default', () => {
                const tooltip = showTooltip();

                assert.equal('rgb(128, 128, 128)', getComputedStyle(tooltip).borderTopColor);
                assert.equal('1px', getComputedStyle(tooltip).borderTopWidth);
            });

            it('should merge the given styles into the defaults', () => {
                const tooltip = showTooltip({
                    background: 'rgb(0, 0, 255)',
                    'border-color': 'rgb(255, 0, 0)',
                });

                assert.equal('rgb(0, 0, 255)', getComputedStyle(tooltip).backgroundColor);
                assert.equal('rgb(255, 0, 0)', getComputedStyle(tooltip).borderTopColor);
                assert.equal('bold', tooltip.style.fontWeight);
            });
        });

        describe('events.click.block', () => {
            it('should invoke the callback function with the correct data', () => {
                const event = new MouseEvent('click');

                const proxy = sinon.fake();

                getFunnel().draw(getBasicData(), {
                    events: {
                        click: {
                            block: (e, d) => {
                                proxy({
                                    index: d.index,
                                    node: d.node,
                                    label: d.label.raw,
                                    value: d.value,
                                });
                            },
                        },
                    },
                });

                select('#funnel path').node().dispatchEvent(event);

                assert.isTrue(proxy.calledWith({
                    index: 0,
                    node: select('#funnel path').node(),
                    label: 'Node',
                    value: 1000,
                }));
            });

            it('should pass the DOM event as the first argument', () => {
                const event = new MouseEvent('click');

                const proxy = sinon.fake();

                getFunnel().draw(getBasicData(), {
                    events: {
                        click: {
                            block: proxy,
                        },
                    },
                });

                select('#funnel path').node().dispatchEvent(event);

                assert.strictEqual(proxy.firstCall.args[0], event);
            });

            it('should pass the original data entry of the clicked block', () => {
                const event = new MouseEvent('click');

                const data = [
                    { label: 'One', value: 300, url: '#one' },
                    { label: 'Two', value: 200, url: '#two' },
                    { label: 'Three', value: 100, url: '#three' },
                ];
                const proxy = sinon.fake();

                getFunnel().draw(data, {
                    events: {
                        click: {
                            block: (e, d) => proxy(d.data),
                        },
                    },
                });

                selectAll('#funnel path').nodes()[1].dispatchEvent(event);

                assert.isTrue(proxy.calledOnce);
                assert.strictEqual(proxy.firstCall.args[0], data[1]);
                assert.equal(proxy.firstCall.args[0].url, '#two');
            });

            it('should not trigger errors when null', () => {
                const event = new MouseEvent('click');

                getFunnel().draw(getBasicData(), {
                    events: {
                        click: {
                            block: null,
                        },
                    },
                });

                select('#funnel path').node().dispatchEvent(event);
            });

            it('should set the block style to `cursor: pointer` when non-null', () => {
                getFunnel().draw(getBasicData(), {
                    events: {
                        click: {
                            block: () => {
                            },
                        },
                    },
                });

                assert.equal('pointer', select('#funnel path').style('cursor'));
            });
        });

        ['mouseover', 'mouseout'].forEach((type) => {
            describe(`events.${type}.block`, () => {
                it('should invoke the callback with the event and hovered block data', () => {
                    const event = new MouseEvent(type);
                    const data = [
                        { label: 'One', value: 300 },
                        { label: 'Two', value: 200 },
                    ];
                    const proxy = sinon.fake();

                    getFunnel().draw(data, {
                        events: {
                            [type]: {
                                block: proxy,
                            },
                        },
                    });

                    selectAll('#funnel path').nodes()[1].dispatchEvent(event);

                    assert.isTrue(proxy.calledOnce);
                    assert.strictEqual(proxy.firstCall.args[0], event);
                    assert.equal(proxy.firstCall.args[1].index, 1);
                    assert.strictEqual(proxy.firstCall.args[1].data, data[1]);
                });

                it('should not replace the block.highlight effect', () => {
                    const proxy = sinon.fake();

                    getFunnel().draw([
                        { label: 'A', value: 1, fillColor: '#fff' },
                    ], {
                        block: {
                            highlight: {
                                enabled: true,
                            },
                        },
                        events: {
                            [type]: {
                                block: proxy,
                            },
                        },
                    });

                    const path = select('#funnel path');
                    const originalFill = path.attr('fill');

                    path.node().dispatchEvent(new MouseEvent('mouseover'));
                    assert.equal('#cccccc', path.attr('fill'));
                    path.node().dispatchEvent(new MouseEvent('mouseout'));
                    assert.equal(originalFill, path.attr('fill'));

                    assert.isTrue(proxy.calledOnce);
                });

                it('should not trigger errors when null', () => {
                    const event = new MouseEvent(type);

                    getFunnel().draw(getBasicData(), {
                        events: {
                            [type]: {
                                block: null,
                            },
                        },
                    });

                    select('#funnel path').node().dispatchEvent(event);
                });
            });
        });
    });
});
