import _ from 'lodash';
import * as d3 from 'd3';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';
import chai from 'chai';
import spies from 'chai-spies';

import D3Funnel from '../../src/d3-funnel/D3Funnel';

const assert = chai.assert;

chai.use(spies);

function getFunnel() {
	return new D3Funnel('#funnel');
}

function getSvg() {
	return d3.select('#funnel').selectAll('svg');
}

function getBasicData() {
	return [['Node', 1000]];
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

const defaults = _.clone(D3Funnel.defaults, true);

describe('D3Funnel', () => {
	beforeEach((done) => {
		// Reset any styles
		d3.select('#funnel').attr('style', null);

		// Reset defaults
		D3Funnel.defaults = _.clone(defaults, true);

		// Clear out sandbox
		document.getElementById('sandbox').innerHTML = '';

		done();
	});

	describe('constructor', () => {
		it('should instantiate without error', () => {
			new D3Funnel('#funnel');  // eslint-disable-line no-new
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

			it('should throw an error when the first data array element is not an array', () => {
				const funnel = getFunnel();

				assert.throws(() => {
					funnel.draw(['Not array']);
				}, Error, 'Data array elements must be arrays.');
			});

			it('should throw an error when the first data array element does not have a count', () => {
				const funnel = getFunnel();

				assert.throws(() => {
					funnel.draw([['Only one']]);
				}, Error, 'Data array elements must contain a label and value.');
			});

			it('should draw as many blocks as there are elements', () => {
				getFunnel().draw([
					['Node A', 1],
					['Node B', 2],
					['Node C', 3],
					['Node D', 4],
				]);

				assert.equal(4, getSvg().selectAll('path').nodes().length);
			});

			it('should pass any row-specified formatted values to the label formatter', () => {
				getFunnel().draw([
					['Node A', [1, 'One']],
					['Node B', 2],
					['Node C', [3, 'Three']],
				]);

				const texts = getSvg().selectAll('text').nodes();

				assert.equal('Node A: One', d3.select(texts[0]).text());
				assert.equal('Node B: 2', d3.select(texts[1]).text());
				assert.equal('Node C: Three', d3.select(texts[2]).text());
			});

			it('should use colors assigned to a data element', () => {
				getFunnel().draw([
					['A', 1, '#111'],
					['B', 2, '#222'],
					['C', 3],
					['D', 4, '#444'],
				]);

				const paths = getSvg().selectAll('path').nodes();
				const colorScale = scaleOrdinal(schemeCategory10).domain(d3.range(0, 10));

				assert.equal('#111', d3.select(paths[0]).attr('fill'));
				assert.equal('#222', d3.select(paths[1]).attr('fill'));
				assert.equal(colorScale(2), d3.select(paths[2]).attr('fill'));
				assert.equal('#444', d3.select(paths[3]).attr('fill'));
			});

			it('should use label colors assigned to a data element', () => {
				getFunnel().draw([
					['A', 1, null, '#111'],
					['B', 2, null, '#222'],
					['C', 3],
					['D', 4, null, '#444'],
				]);

				const texts = getSvg().selectAll('text').nodes();

				assert.equal('#111', d3.select(texts[0]).attr('fill'));
				assert.equal('#222', d3.select(texts[1]).attr('fill'));
				assert.equal('#fff', d3.select(texts[2]).attr('fill'));
				assert.equal('#444', d3.select(texts[3]).attr('fill'));
			});

			it('should remove other elements from container', () => {
				const container = d3.select('#funnel');
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
				const container = d3.select('#funnel');
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

				assert.isTrue(document.getElementById('d3-funnel-chart-0') !== null);
			});

			it('should skip any IDs that exist on the dom', () => {
				const maxId = 5;
				const sandbox = document.querySelector('#sandbox');

				// Add multiple IDs to the DOM
				for (let i = 0; i < maxId; i++) {
					const span = document.createElement('span');

					span.id = `d3-funnel-chart-${i}`;

					sandbox.appendChild(span);
				}

				getFunnel().draw(getBasicData());

				const chart = document.getElementById('d3-funnel-chart-5');

				assert.isTrue(chart !== null);
				assert.equal('svg', chart.tagName);
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

			assert.isTrue(d3.select('#funnel text').attr('fill').indexOf('#777') > -1);
		});
	});

	describe('options', () => {
		describe('chart.width/height', () => {
			it('should default to the container\'s dimensions', () => {
				['width', 'height'].forEach((direction) => {
					d3.select('#funnel').style(direction, '250px');

					getFunnel().draw(getBasicData());

					assert.equal(250, getSvg().node().getBBox()[direction]);
				});
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
					d3.select('#funnel').style(direction, '200px');

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
				d3.select('#funnel').style('height', '250px');

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
				d3.select('#funnel').style('height', '300px');

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

				assert.equal(100, getPathBottomWidth(d3.select('path')));
			});
		});

		describe('chart.bottomPinch', () => {
			it('should set the last n number of blocks to have the width of chart.bottomWidth', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
					['C', 3],
				], {
					chart: {
						width: 450,
						bottomWidth: 1 / 3,
						bottomPinch: 2,
					},
				});

				const paths = d3.selectAll('path').nodes();

				assert.equal(150, paths[1].getBBox().width);
				assert.equal(150, paths[2].getBBox().width);
			});
		});

		describe('chart.inverted', () => {
			it('should draw the chart in a top-to-bottom arrangement by default', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					chart: {
						width: 200,
						bottomWidth: 1 / 2,
					},
				});

				const paths = d3.selectAll('path').nodes();

				assert.equal(200, getPathTopWidth(d3.select(paths[0])));
				assert.equal(100, getPathBottomWidth(d3.select(paths[1])));
			});

			it('should draw the chart in a bottom-to-top arrangement when true', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					chart: {
						width: 200,
						bottomWidth: 1 / 2,
						inverted: true,
					},
				});

				const paths = d3.selectAll('path').nodes();

				assert.equal(100, getPathTopWidth(d3.select(paths[0])));
				assert.equal(200, getPathBottomWidth(d3.select(paths[1])));
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

				assert.equal(2, d3.selectAll('#funnel path').nodes().length);
			});

			it('should create a quadratic Bezier curve on each path', () => {
				getFunnel().draw(getBasicData(), {
					chart: {
						curve: {
							enabled: true,
						},
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				const quadraticPaths = paths.filter((path) =>
					d3.select(path).attr('d').indexOf('Q') > -1
				);

				assert.equal(paths.length, quadraticPaths.length);
			});
		});

		describe('block.dynamicHeight', () => {
			it('should use equal heights when false', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					chart: {
						height: 300,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.equal(150, getPathHeight(d3.select(paths[0])));
				assert.equal(150, getPathHeight(d3.select(paths[1])));
			});

			it('should use proportional heights when true', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					chart: {
						height: 300,
					},
					block: {
						dynamicHeight: true,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.equal(100, parseInt(getPathHeight(d3.select(paths[0])), 10));
				assert.equal(200, parseInt(getPathHeight(d3.select(paths[1])), 10));
			});

			it('should not have NaN in the last path when bottomWidth is equal to 0%', () => {
				// A very specific cooked-up example that could trigger NaN
				getFunnel().draw([
					['A', 120],
					['B', 40],
					['C', 20],
					['D', 15],
				], {
					chart: {
						height: 300,
						bottomWidth: 0,
					},
					block: {
						dynamicHeight: true,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.equal(-1, d3.select(paths[3]).attr('d').indexOf('NaN'));
			});

			it('should not error when bottomWidth is equal to 100%', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
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
		});

		describe('block.dynamicSlope', () => {
			it('should give each block top width relative to its value', () => {
				getFunnel().draw([
					['A', 100],
					['B', 55],
					['C', 42],
					['D', 74],
				], {
					chart: {
						width: 100,
					},
					block: {
						dynamicSlope: true,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[0]))), 100);
				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[1]))), 55);
				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[2]))), 42);
				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[3]))), 74);
			});

			it('should give last block top width equal to bottom widht', () => {
				getFunnel().draw([
					['A', 100],
					['B', 55],
					['C', 42],
					['D', 74],
				], {
					chart: {
						width: 100,
					},
					block: {
						dynamicSlope: true,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[3]))), 74);
				assert.equal(parseFloat(getPathBottomWidth(d3.select(paths[3]))), 74);
			});

			it('should use bottomWidth value when false', () => {
				getFunnel().draw([
					['A', 100],
					['B', 90],
				], {
					chart: {
						width: 100,
						bottomWidth: 0.4,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[0]))), 100);
				assert.equal(parseFloat(getPathBottomWidth(d3.select(paths[1]))), 40);
			});

			it('should use proportional widths when true', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					chart: {
						width: 100,
					},
					block: {
						dynamicSlope: true,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[0]))), 100);
				assert.equal(parseFloat(getPathBottomWidth(d3.select(paths[1]))), 200);
			});
		});

		describe('block.barOverlay', () => {
			it('should draw value overlay within each path', () => {
				getFunnel().draw([
					['A', 10],
					['B', 20],
				], {
					block: {
						barOverlay: true,
					},
				});

				// draw 2 path for each data point
				assert.equal(4, d3.selectAll('#funnel path').nodes().length);
			});

			it('should draw value overlay with overridden total count', () => {
				getFunnel().draw([
					['A', 10],
					['B', 20],
				], {
					chart: {
						totalCount: 100,
					},
					block: {
						barOverlay: true,
					},
				});

				const paths = d3.selectAll('path').nodes();

				const APathFullWidth = getPathTopWidth(d3.select(paths[0]));
				const APathOverlayWidth = getPathTopWidth(d3.select(paths[1]));
				const BPathFullWidth = getPathTopWidth(d3.select(paths[2]));
				const BPathOverlayWidth = getPathTopWidth(d3.select(paths[3]));

				assert.equal(10, Math.round((APathOverlayWidth / APathFullWidth) * 100));
				assert.equal(20, Math.round((BPathOverlayWidth / BPathFullWidth) * 100));
			});
		});

		describe('block.fill.scale', () => {
			it('should use a function\'s return value', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
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

				assert.equal('#111', d3.select(paths[0]).attr('fill'));
				assert.equal('#222', d3.select(paths[1]).attr('fill'));
			});

			it('should use an array\'s return value', () => {
				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					block: {
						fill: {
							scale: ['#111', '#222'],
						},
					},
				});

				const paths = getSvg().selectAll('path').nodes();

				assert.equal('#111', d3.select(paths[0]).attr('fill'));
				assert.equal('#222', d3.select(paths[1]).attr('fill'));
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

				// Cannot try to re-select the camelCased linearGradient element
				// due to a Webkit bug in the current PhantomJS; workaround is
				// to select the known ID of the linearGradient element
				// https://bugs.webkit.org/show_bug.cgi?id=83438
				assert.equal(1, d3.selectAll('#funnel defs #d3-funnel-chart-0-gradient-0').nodes().length);

				assert.equal('url(#d3-funnel-chart-0-gradient-0)', d3.select('#funnel path').attr('fill'));
			});

			it('should use solid fill when not set to \'gradient\'', () => {
				getFunnel().draw(getBasicData());

				// Check for valid hex string
				assert.isTrue(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(
					d3.select('#funnel path').attr('fill')
				));
			});
		});

		describe('block.minHeight', () => {
			it('should give each block the minimum height specified', () => {
				getFunnel().draw([
					['A', 299],
					['B', 1],
				], {
					chart: {
						height: 300,
					},
					block: {
						dynamicHeight: true,
						minHeight: 10,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.isAbove(parseFloat(getPathHeight(d3.select(paths[0]))), 10);
				assert.isAbove(parseFloat(getPathHeight(d3.select(paths[1]))), 10);
			});

			it('should decrease the height of blocks above the minimum', () => {
				getFunnel().draw([
					['A', 299],
					['B', 1],
				], {
					chart: {
						height: 300,
					},
					block: {
						dynamicHeight: true,
						minHeight: 10,
					},
				});

				const paths = d3.selectAll('#funnel path').nodes();

				assert.isBelow(parseFloat(getPathHeight(d3.select(paths[0]))), 290);
			});
		});

		describe('block.highlight', () => {
			it('should change block color on hover', () => {
				const event = document.createEvent('CustomEvent');
				event.initCustomEvent('mouseover', false, false, null);

				getFunnel().draw([
					['A', 1, '#fff'],
				], {
					block: {
						highlight: true,
					},
				});

				d3.select('#funnel path').node().dispatchEvent(event);

				// #fff * -1/5 => #cccccc
				assert.equal('#cccccc', d3.select('#funnel path').attr('fill'));
			});
		});

		describe('label.fontFamily', () => {
			it('should set the label\'s font size to the specified amount', () => {
				getFunnel().draw(getBasicData(), {
					label: {
						fontFamily: 'Open Sans',
					},
				});

				assert.equal('Open Sans', d3.select('#funnel text').attr('font-family'));
			});
		});

		describe('label.fontSize', () => {
			it('should set the label\'s font size to the specified amount', () => {
				getFunnel().draw(getBasicData(), {
					label: {
						fontSize: '16px',
					},
				});

				assert.equal('16px', d3.select('#funnel text').attr('font-size'));
			});
		});

		describe('label.fill', () => {
			it('should set the label\'s fill color to the specified color', () => {
				getFunnel().draw(getBasicData(), {
					label: {
						fill: '#777',
					},
				});

				assert.isTrue(d3.select('#funnel text').attr('fill').indexOf('#777') > -1);
			});
		});

		describe('label.format', () => {
			it('should parse a string template', () => {
				getFunnel().draw(getBasicData(), {
					label: {
						format: '{l} {v} {f}',
					},
				});

				// Node.js does not have localization, so toLocaleString() will
				// leave the value untouched
				// https://github.com/joyent/node/issues/4689
				assert.equal('Node 1000 1000', d3.select('#funnel text').text());
			});

			it('should create split multiple lines into multiple tspans', () => {
				getFunnel().draw(getBasicData(), {
					label: {
						format: '{l}\n{v}',
					},
				});

				const tspans = d3.selectAll('#funnel text tspan').nodes();

				assert.equal('Node', d3.select(tspans[0]).text());
				assert.equal('1000', d3.select(tspans[1]).text());
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

				const tspans = d3.selectAll('#funnel text tspan').nodes();

				assert.equal(-20, d3.select(tspans[0]).attr('dy'));
				assert.equal(20, d3.select(tspans[1]).attr('dy'));
				assert.equal(20, d3.select(tspans[2]).attr('dy'));
			});

			it('should pass values to a supplied function', () => {
				getFunnel().draw(getBasicData(), {
					label: {
						format: (label, value, fValue) => `${label}/${value}/${fValue}`,
					},
				});

				assert.equal('Node/1000/null', d3.select('#funnel text').text());
			});
		});

		describe('events.click.block', () => {
			it('should invoke the callback function with the correct data', () => {
				const event = document.createEvent('CustomEvent');
				event.initCustomEvent('click', false, false, null);

				const spy = chai.spy();

				getFunnel().draw(getBasicData(), {
					events: {
						click: {
							block: (d, i) => {
								spy({
									index: d.index,
									node: d.node,
									label: d.label.raw,
									value: d.value,
								}, i);
							},
						},
					},
				});

				d3.select('#funnel path').node().dispatchEvent(event);

				chai.expect(spy).to.have.been.called.once.with({
					index: 0,
					node: d3.select('#funnel path').node(),
					label: 'Node',
					value: 1000,
				}, 0);
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

				d3.select('#funnel path').node().dispatchEvent(event);
			});
		});
	});
});
