describe('D3Funnel', function () {
	var getFunnel, getSvg, getBasicData, getPathHeight, getCommandHeight;

	beforeEach(function (done) {
		getFunnel = function () {
			return new D3Funnel('#funnel');
		};
		getSvg = function () {
			return d3.select('#funnel').selectAll('svg');
		};
		getBasicData = function () {
			return [['Node', 1000]];
		};
		getPathHeight = function (path) {
			var commands = path.attr('d').split(' ');

			return getCommandHeight(commands[2]) - getCommandHeight(commands[0]);
		};
		getCommandHeight = function (command) {
			return parseFloat(command.split(',')[1]);
		};

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

				colorScale = d3.scale.category10();

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

	describe('options', function () {
		describe('width', function () {
			it('should set the funnel\'s width to the specified amount', function () {
				getFunnel().draw(getBasicData(), {
					width: 200,
				});

				assert.equal(200, getSvg().node().getBBox().width);
			});
		});

		describe('height', function () {
			it('should set the funnel\'s height to the specified amount', function () {
				getFunnel().draw(getBasicData(), {
					height: 200,
				});

				assert.equal(200, getSvg().node().getBBox().height);
			});
		});

		describe('isCurved', function () {
			it('should create an additional path on top of the trapezoids', function () {
				getFunnel().draw(getBasicData(), {
					isCurved: true,
				});

				assert.equal(2, d3.selectAll('#funnel path')[0].length);
			});

			it('should create a quadratic Bezier curve on each path', function () {
				getFunnel().draw(getBasicData(), {
					isCurved: true,
				});

				var paths = d3.selectAll('#funnel path');

				var quadraticPaths = paths.filter(function () {
					return d3.select(this).attr('d').indexOf('Q') > -1;
				});

				assert.equal(paths[0].length, quadraticPaths[0].length);
			});
		});

		describe('fillType', function () {
			it('should create gradients when set to \'gradient\'', function () {
				getFunnel().draw(getBasicData(), {
					fillType: 'gradient',
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

		describe('dynamicArea', function () {
			it('should use equal heights when false', function () {
				var paths;

				getFunnel().draw([
					['A', 1],
					['B', 2],
				], {
					height: 300,
				});

				paths = d3.selectAll('#funnel path')[0];

				assert.equal(150, getPathHeight(d3.select(paths[0])));
				assert.equal(150, getPathHeight(d3.select(paths[1])));
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
					}
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

		describe('onItemClick', function () {
			it('should invoke the callback function with the correct data', function () {
				var event = document.createEvent('CustomEvent');
				event.initCustomEvent('click', false, false, null);

				var spy = chai.spy();

				getFunnel().draw(getBasicData(), {
					onItemClick: function (d, i) {
						spy({
							index: d.index,
							label: d.label,
							value: d.value,
						}, i);
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
