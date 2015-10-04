/* global d3, assert, chai, D3Funnel */

function getFunnel() {
	return new D3Funnel('#funnel');
}

function getSvg() {
	return d3.select('#funnel').selectAll('svg');
}

function getBasicData() {
	return [['Node', 1000]];
}

function getPathHeight(path) {
	var commands = path.attr('d').split(' ');

	return getCommandHeight(commands[2]) - getCommandHeight(commands[0]);
}

function getCommandHeight(command) {
	return parseFloat(command.split(',')[1]);
}

var defaults = _.clone(D3Funnel.defaults, true);

describe('D3Funnel', function () {
	beforeEach(function (done) {
		d3.select('#funnel').attr('style', null);

		D3Funnel.defaults = _.clone(defaults, true);

		done();
	});

	describe('constructor', function () {
		it('should instantiate without error', function () {
			new D3Funnel('#funnel');
		});
	});

	describe('methods', function () {
		describe('draw', function () {
			it('should draw a chart on the identified target', function () {
				getFunnel().draw(getBasicData(), {});

				assert.equal(1, getSvg()[0].length);
			});

			it('should draw when second argument is missing', function () {
				getFunnel().draw(getBasicData());

				assert.equal(1, getSvg()[0].length);
			});

			it('should throw an exception on invalid data', function () {
				var funnel = getFunnel();

				assert.throws(function () {
					funnel.draw(['One dimensional', 2], {});
				}, Error, 'Funnel data is not valid.');
			});

			it('should draw as many blocks as there are elements', function () {
				getFunnel().draw([
					['Node A', 1],
					['Node B', 2],
					['Node C', 3],
					['Node D', 4],
				]);

				assert.equal(4, getSvg().selectAll('path')[0].length);
			});

			it('should use colors assigned to a data element', function () {
				var paths;
				var colorScale;

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

			it('should use label colors assigned to a data element', function () {
				var texts;

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
		});

		describe('destroy', function () {
			it('should remove a drawn SVG element', function () {
				var funnel = getFunnel();

				funnel.draw(getBasicData(), {});
				funnel.destroy();

				assert.equal(0, getSvg()[0].length);
			});
		});
	});

	describe('defaults', function () {
		it('should affect all default options', function () {
			D3Funnel.defaults.label.fill = '#777';

			getFunnel().draw(getBasicData(), {});

			assert.isTrue(d3.select('#funnel text').attr('fill').indexOf('#777') > -1);
		});
	});

	describe('options', function () {
		describe('chart.width', function () {
			it ('should default to the container\'s width', function () {
				d3.select('#funnel').style('width', '250px');

				getFunnel().draw(getBasicData(), {});

				assert.equal(250, getSvg().node().getBBox().width);
			});

			it('should set the funnel\'s width to the specified amount', function () {
				getFunnel().draw(getBasicData(), {
					chart: {
						width: 200,
					},
				});

				assert.equal(200, getSvg().node().getBBox().width);
			});
		});

		describe('chart.height', function () {
			it ('should default to the container\'s height', function () {
				d3.select('#funnel').style('height', '250px');

				getFunnel().draw(getBasicData(), {});

				assert.equal(250, getSvg().node().getBBox().height);
			});

			it('should set the funnel\'s height to the specified amount', function () {
				getFunnel().draw(getBasicData(), {
					chart: {
						height: 200,
					},
				});

				assert.equal(200, getSvg().node().getBBox().height);
			});
		});

		describe('chart.curve.enabled', function () {
			it('should create an additional path on top of the trapezoids', function () {
				getFunnel().draw(getBasicData(), {
					chart: {
						curve: {
							enabled: true,
						},
					},
				});

				assert.equal(2, d3.selectAll('#funnel path')[0].length);
			});

			it('should create a quadratic Bezier curve on each path', function () {
				getFunnel().draw(getBasicData(), {
					chart: {
						curve: {
							enabled: true,
						},
					},
				});

				var paths = d3.selectAll('#funnel path');

				var quadraticPaths = paths.filter(function () {
					return d3.select(this).attr('d').indexOf('Q') > -1;
				});

				assert.equal(paths[0].length, quadraticPaths[0].length);
			});
		});

		describe('block.dynamicHeight', function () {
			it('should use equal heights when false', function () {
				var paths;

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

			it('should use proportional heights when true', function () {
				var paths;

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

			it('should not have NaN in the last path when bottomWidth is equal to 0%', function () {
				var paths;

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

				assert.equal(-1, d3.select(paths[3]).attr('d').indexOf('NaN'))
			});

			it('should not error when bottomWidth is equal to 100%', function () {
				var paths;

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

				paths = d3.selectAll('#funnel path')[0];

			});
		});

		describe('block.fill.type', function () {
			it('should create gradients when set to \'gradient\'', function () {
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

			it('should use solid fill when not set to \'gradient\'', function () {
				getFunnel().draw(getBasicData(), {});

				// Check for valid hex string
				assert.isTrue(/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(
					d3.select('#funnel path').attr('fill')
				));
			});
		});

		describe('block.minHeight', function () {
			it('should give each block the minimum height specified', function () {
				var paths;

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

			it('should decrease the height of blocks above the minimum', function () {
				var paths;

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

		describe('block.highlight', function () {
			it('should change block color on hover', function () {
				var event = document.createEvent('CustomEvent');
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


		describe('label.fontSize', function () {
			it('should set the label\'s font size to the specified amount', function () {
				getFunnel().draw(getBasicData(), {
					label: {
						fontSize: '16px',
					},
				});

				assert.isTrue(d3.select('#funnel text').attr('style').indexOf('font-size: 16px') > -1);
			});
		});

		describe('label.fill', function () {
			it('should set the label\'s fill color to the specified color', function () {
				getFunnel().draw(getBasicData(), {
					label: {
						fill: '#777',
					},
				});

				assert.isTrue(d3.select('#funnel text').attr('fill').indexOf('#777') > -1);
			});
		});

		describe('label.format', function () {
			it('should parse a string template', function () {
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

			it('should pass values to a supplied function', function () {
				getFunnel().draw(getBasicData(), {
					label: {
						format: function (label, value, fValue) {
							return label + '/' + value + '/' + fValue;
						}
					}
				});

				assert.equal('Node/1000/null', d3.select('#funnel text').text());
			});
		});

		describe('events.click.block', function () {
			it('should invoke the callback function with the correct data', function () {
				var event = document.createEvent('CustomEvent');
				event.initCustomEvent('click', false, false, null);

				var spy = chai.spy();

				getFunnel().draw(getBasicData(), {
					events: {
						click: {
							block: function (d, i) {
								spy({
									index: d.index,
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
					label: 'Node',
					value: 1000,
				}, 0);
			});
		});
	});
});
