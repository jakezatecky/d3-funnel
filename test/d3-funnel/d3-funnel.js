import _ from 'lodash';
import d3 from 'd3';
import chai from 'chai';
import spies from 'chai-spies';

import D3Funnel from '../../src/d3-funnel/d3-funnel';

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

function isLetter(str) {
	return str.length === 1 && str.match(/[a-z]/i);
}

const defaults = _.clone(D3Funnel.defaults, true);

describe('D3Funnel', () => {
	beforeEach((done) => {
		d3.select('#funnel').attr('style', null);

		D3Funnel.defaults = _.clone(defaults, true);

		done();
	});

	describe('constructor', () => {
		it('should instantiate without error', () => {
			new D3Funnel('#funnel');
		});
	});

	describe('methods', () => {
		describe('draw', () => {
			it('should draw a chart on the identified target', () => {
				getFunnel().draw(getBasicData());

				assert.equal(1, getSvg()[0].length);
			});

			it('should draw when second argument is missing', () => {
				getFunnel().draw(getBasicData());

				assert.equal(1, getSvg()[0].length);
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

			it('should throw an error when the first data array element does not have two elements', () => {
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

				assert.equal(4, getSvg().selectAll('path')[0].length);
			});

			it('should use colors assigned to a data element', () => {
				let paths;
				let colorScale;

				getFunnel().draw([
					['A', 1, '#111'],
					['B', 2, '#222'],
					['C', 3],
					['D', 4, '#444'],
				]);

				paths = getSvg().selectAll('path')[0];

				colorScale = d3.scale.category10().domain(d3.range(0, 10));

				assert.equal('#111', d3.select(paths[0]).attr('fill'));
				assert.equal('#222', d3.select(paths[1]).attr('fill'));
				assert.equal(colorScale(2), d3.select(paths[2]).attr('fill'));
				assert.equal('#444', d3.select(paths[3]).attr('fill'));
			});

			it('should use label colors assigned to a data element', () => {
				let texts;

				getFunnel().draw([
					['A', 1, null, '#111'],
					['B', 2, null, '#222'],
					['C', 3],
					['D', 4, null, '#444'],
				]);

				texts = getSvg().selectAll('text')[0];

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
		});

		describe('destroy', () => {
			it('should remove a drawn SVG element', () => {
				const funnel = getFunnel();

				funnel.draw(getBasicData());
				funnel.destroy();

				assert.equal(0, getSvg()[0].length);
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
		describe('chart.width', () => {
			it('should default to the container\'s width', () => {
				d3.select('#funnel').style('width', '250px');

				getFunnel().draw(getBasicData());

				assert.equal(250, getSvg().node().getBBox().width);
			});

			it('should set the funnel\'s width to the specified amount', () => {
				getFunnel().draw(getBasicData(), {
					chart: {
						width: 200,
					},
				});

				assert.equal(200, getSvg().node().getBBox().width);
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

				const paths = d3.selectAll('path');

				assert.equal(150, paths[0][1].getBBox().width);
				assert.equal(150, paths[0][2].getBBox().width);
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

				const paths = d3.selectAll('path');

				assert.equal(200, getPathTopWidth(d3.select(paths[0][0])));
				assert.equal(100, getPathBottomWidth(d3.select(paths[0][1])));
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

				const paths = d3.selectAll('path');

				assert.equal(100, getPathTopWidth(d3.select(paths[0][0])));
				assert.equal(200, getPathBottomWidth(d3.select(paths[0][1])));
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

				assert.equal(2, d3.selectAll('#funnel path')[0].length);
			});

			it('should create a quadratic Bezier curve on each path', () => {
				getFunnel().draw(getBasicData(), {
					chart: {
						curve: {
							enabled: true,
						},
					},
				});

				const paths = d3.selectAll('#funnel path');

				const quadraticPaths = paths.filter(function () {
					return d3.select(this).attr('d').indexOf('Q') > -1;
				});

				assert.equal(paths[0].length, quadraticPaths[0].length);
			});
		});

		describe('block.dynamicHeight', () => {
			it('should use equal heights when false', () => {
				let paths;

				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					chart: {
						height: 300,
					},
				});

				paths = d3.selectAll('#funnel path')[0];

				assert.equal(150, getPathHeight(d3.select(paths[0])));
				assert.equal(150, getPathHeight(d3.select(paths[1])));
			});

			it('should use proportional heights when true', () => {
				let paths;

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

				paths = d3.selectAll('#funnel path')[0];

				assert.equal(100, parseInt(getPathHeight(d3.select(paths[0])), 10));
				assert.equal(200, parseInt(getPathHeight(d3.select(paths[1])), 10));
			});

			it('should not have NaN in the last path when bottomWidth is equal to 0%', () => {
				let paths;

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

				paths = d3.selectAll('#funnel path')[0];

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

		describe('block.dynamicSlope', function () {
			it('should give each block top width relative to its value', function () {
				let paths;

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

				paths = d3.selectAll('#funnel path')[0];

				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[0]))), 100);
				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[1]))), 55);
				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[2]))), 42);
				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[3]))), 74);
			});

			it('should give last block top width equal to bottom widht', function () {
				let paths;

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

				paths = d3.selectAll('#funnel path')[0];

				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[3]))), 74);
				assert.equal(parseFloat(getPathBottomWidth(d3.select(paths[3]))), 74);
			});

			it('should use bottomWidth value when false', function () {
				let paths;

				getFunnel().draw([
					['A', 100],
					['B', 90],
				], {
					chart: {
						width: 100,
						bottomWidth: 0.4,
					},
				});

				paths = d3.selectAll('#funnel path')[0];

				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[0]))), 100);
				assert.equal(parseFloat(getPathBottomWidth(d3.select(paths[1]))), 40);
			});

			it('should use proportional widths when true', function () {
				let paths;

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

				paths = d3.selectAll('#funnel path')[0];

				assert.equal(parseFloat(getPathTopWidth(d3.select(paths[0]))), 100);
				assert.equal(parseFloat(getPathBottomWidth(d3.select(paths[1]))), 200);
			});
		});

		describe('block.fill.scale', () => {
			it('should use a function\'s return value', () => {
				let paths;

				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					block: {
						fill: {
							scale: function (index) {
								if (index === 0) {
									return '#111';
								}

								return '#222';
							},
						},
					},
				});

				paths = getSvg().selectAll('path')[0];

				assert.equal('#111', d3.select(paths[0]).attr('fill'));
				assert.equal('#222', d3.select(paths[1]).attr('fill'));
			});

			it('should use an array\'s return value', () => {
				let paths;

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

				paths = getSvg().selectAll('path')[0];

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
				assert.equal(1, d3.selectAll('#funnel defs #gradient-0')[0].length);

				assert.equal('url(#gradient-0)', d3.select('#funnel path').attr('fill'));
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
				let paths;

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

				paths = d3.selectAll('#funnel path')[0];

				assert.isAbove(parseFloat(getPathHeight(d3.select(paths[0]))), 10);
				assert.isAbove(parseFloat(getPathHeight(d3.select(paths[1]))), 10);
			});

			it('should decrease the height of blocks above the minimum', () => {
				let paths;

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

				paths = d3.selectAll('#funnel path')[0];

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

			it('should pass values to a supplied function', () => {
				getFunnel().draw(getBasicData(), {
					label: {
						format: function (label, value, fValue) {
							return label + '/' + value + '/' + fValue;
						},
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
							block: function (d, i) {
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
