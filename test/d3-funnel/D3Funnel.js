import { cloneDeep } from 'lodash';
import {
    range,
    select,
    selectAll,
    scaleOrdinal,
    schemeCategory10,
} from 'd3';
import chai from 'chai';
import sinon from 'sinon';

import D3Funnel from '../../src/d3-funnel/D3Funnel';

const { assert } = chai;

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
        x = x.substr(1);
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
                    { label: 'Node A', value: 1, backgroundColor: '#111' },
                    { label: 'Node B', value: 2, backgroundColor: '#222' },
                    { label: 'Node C', value: 3 },
                    { label: 'Node D', value: 4, backgroundColor: '#444' },
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

        describe('destroy', () => {
            it('should remove a drawn SVG element', () => {
                const funnel = getFunnel();

                funnel.draw(getBasicData());
                funnel.destroy();

                assert.equal(0, getSvg().nodes().length);
            });
        });
    });

    describe('defaults', () => {
        it('should affect all default options', () => {
            D3Funnel.defaults.label.fill = '#777';

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

        describe('chart.bottomWidth', () => {
            it('should set the bottom tip width to the specified percentage', () => {
                getFunnel().draw(getBasicData(), {
                    chart: {
                        width: 200,
                        bottomWidth: 1 / 2,
                    },
                });

                assert.equal(100, getPathBottomWidth(select('path')));
            });
        });

        describe('chart.bottomPinch', () => {
            it('should set the last n number of blocks to have the width of chart.bottomWidth', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                    { label: 'C', value: 3 },
                ], {
                    chart: {
                        width: 450,
                        bottomWidth: 1 / 3,
                        bottomPinch: 2,
                    },
                });

                const paths = selectAll('path').nodes();

                assert.equal(150, paths[1].getBBox().width);
                assert.equal(150, paths[2].getBBox().width);
            });

            it('should maintain chart.bottomWidth when combined with block.minHeight', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                    { label: 'C', value: 3 },
                ], {
                    chart: {
                        width: 450,
                        height: 100,
                        bottomWidth: 1 / 3,
                        bottomPinch: 1,
                    },
                    block: {
                        dynamicHeight: true,
                        minHeight: 20,
                    },
                });

                const paths = selectAll('path').nodes();

                assert.equal(150, paths[2].getBBox().width);
            });

            it('should maintain chart.bottomWidth when combined with block.dynamicHeight and curve.enabled', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                    { label: 'C', value: 3 },
                    { label: 'D', value: 4 },
                ], {
                    chart: {
                        width: 320,
                        height: 400,
                        bottomWidth: 3 / 8,
                        bottomPinch: 1,
                        curve: {
                            enabled: true,
                        },
                    },
                    block: {
                        dynamicHeight: true,
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
                        bottomWidth: 1 / 2,
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
                        bottomWidth: 1 / 2,
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
        });

        describe('block.dynamicHeight', () => {
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
                        dynamicHeight: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(100, parseInt(getPathHeight(select(paths[0])), 10));
                assert.equal(200, parseInt(getPathHeight(select(paths[1])), 10));
            });

            it('should not have NaN in the last path when bottomWidth is equal to 0%', () => {
                // A very specific cooked-up example that could trigger NaN
                getFunnel().draw([
                    { label: 'A', value: 120 },
                    { label: 'B', value: 40 },
                    { label: 'C', value: 20 },
                    { label: 'D', value: 15 },
                ], {
                    chart: {
                        height: 300,
                        bottomWidth: 0,
                    },
                    block: {
                        dynamicHeight: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(-1, select(paths[3]).attr('d').indexOf('NaN'));
            });

            it('should not error when bottomWidth is equal to 100%', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    chart: {
                        height: 300,
                        bottomWidth: 1,
                    },
                    block: {
                        dynamicHeight: true,
                    },
                });
            });

            it('should not generate NaN or Infinite values when zero', () => {
                getFunnel().draw(getBasicData(), {
                    chart: {
                        height: 0,
                    },
                    block: {
                        dynamicHeight: true,
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
                        dynamicHeight: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(150, getPathHeight(select(paths[0])));
                assert.equal(150, getPathHeight(select(paths[1])));
            });
        });

        describe('block.dynamicSlope', () => {
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
                        dynamicSlope: true,
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
                        dynamicSlope: true,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.equal(parseFloat(getPathTopWidth(select(paths[3]))), 74);
                assert.equal(parseFloat(getPathBottomWidth(select(paths[3]))), 74);
            });

            it('should use bottomWidth value when false', () => {
                getFunnel().draw([
                    { label: 'A', value: 100 },
                    { label: 'B', value: 90 },
                ], {
                    chart: {
                        width: 100,
                        bottomWidth: 0.4,
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
                        barOverlay: true,
                    },
                });

                // draw 2 path for each data point
                assert.equal(4, selectAll('#funnel path').nodes().length);
            });

            it('should draw value overlay with overridden total count', () => {
                getFunnel().draw([
                    { label: 'A', value: 10 },
                    { label: 'B', value: 20 },
                ], {
                    chart: {
                        totalCount: 100,
                    },
                    block: {
                        barOverlay: true,
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
        });

        describe('block.fill.scale', () => {
            it('should use a function\'s return value', () => {
                getFunnel().draw([
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ], {
                    block: {
                        fill: {
                            scale: (index) => {
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
                            scale: ['#111', '#222'],
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
                        dynamicHeight: true,
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
                        dynamicHeight: true,
                        minHeight: 10,
                    },
                });

                const paths = selectAll('#funnel path').nodes();

                assert.isBelow(parseFloat(getPathHeight(select(paths[0]))), 290);
            });
        });

        describe('block.highlight', () => {
            it('should change block color on hover', () => {
                const event = document.createEvent('CustomEvent');
                event.initCustomEvent('mouseover', false, false, null);

                getFunnel().draw([
                    { label: 'A', value: 1, backgroundColor: '#fff' },
                ], {
                    block: {
                        highlight: true,
                    },
                });

                select('#funnel path').node().dispatchEvent(event);

                // #fff * -1/5 => #cccccc
                assert.equal('#cccccc', select('#funnel path').attr('fill'));
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

        describe('label.fill', () => {
            it('should set the label\'s fill color to the specified color', () => {
                getFunnel().draw(getBasicData(), {
                    label: {
                        fill: '#777',
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

        describe('tooltip.enabled', () => {
            it('should render a simple tooltip box when hovering over a block', () => {
                const event = document.createEvent('CustomEvent');
                event.initCustomEvent('mousemove', false, false, null);

                getFunnel().draw(getBasicData(), {
                    tooltip: {
                        enabled: true,
                    },
                });

                select('#funnel path').node().dispatchEvent(event);

                assert.notEqual(null, select('#funnel .d3-funnel-tooltip').node());
            });

            it('should hide the tooltip on mouseout', () => {
                const mouseMove = document.createEvent('CustomEvent');
                const mouseOut = document.createEvent('CustomEvent');
                mouseMove.initCustomEvent('mousemove', false, false, null);
                mouseOut.initCustomEvent('mouseout', false, false, null);

                getFunnel().draw(getBasicData(), {
                    tooltip: {
                        enabled: true,
                    },
                });

                select('#funnel path').node().dispatchEvent(mouseMove);
                select('#funnel path').node().dispatchEvent(mouseOut);

                assert.equal(null, select('#funnel .d3-funnel-tooltip').node());
            });
        });

        describe('tooltip.format', () => {
            it('should render tooltips according to the format provided', () => {
                const event = document.createEvent('CustomEvent');
                event.initCustomEvent('mousemove', false, false, null);

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

        describe('events.click.block', () => {
            it('should invoke the callback function with the correct data', () => {
                const event = document.createEvent('CustomEvent');
                event.initCustomEvent('click', false, false, null);

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

            it('should not trigger errors when null', () => {
                const event = document.createEvent('CustomEvent');
                event.initCustomEvent('click', false, false, null);

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
    });
});
