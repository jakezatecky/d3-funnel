describe('D3Funnel', function () {
	var getFunnel, getSvg, getLength, getBasicData;

	beforeEach(function (done) {
		getFunnel = function () {
			return new D3Funnel('#funnel');
		};
		getSvg = function () {
			return d3.select('#funnel').selectAll('svg');
		};
		getLength = function (selection) {
			return selection[0].length;
		};
		getBasicData = function() {
			return [['Node', 100]];
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
			it('should draw simple chart', function () {
				getFunnel().draw(getBasicData(), {});

				assert.equal(1, getLength(getSvg()));
			});

			it('should throw an exception on invalid data', function () {
				var funnel = getFunnel();

				assert.throws(function () {
					funnel.draw(['One dimensional', 2], {});
				}, Error, 'Funnel data is not valid.');
			});
		});

		describe('destroy', function () {
			it('should remove a drawn SVG element', function () {
				var funnel = getFunnel();

				funnel.draw(getBasicData(), {});
				funnel.destroy();

				assert.equal(0, getLength(getSvg()));
			});
		});
	});

	describe('options', function () {
		describe('width', function () {
			it('should set the funnel\'s width to the specified amount', function () {
				getFunnel().draw(getBasicData(), {
					width: 200
				});

				assert.equal(200, getSvg().node().getBBox().width);
			});
		});

		describe('height', function () {
			it('should set the funnel\'s height to the specified amount', function () {
				getFunnel().draw(getBasicData(), {
					height: 200
				});

				assert.equal(200, getSvg().node().getBBox().height);
			});
		});

		describe('isCurved', function () {
			it('should create an additional path on top of the trapezoids', function () {
				getFunnel().draw(getBasicData(), {
					isCurved: true
				});

				assert.equal(2, d3.selectAll('#funnel path')[0].length);
			});

			it('should create a quadratic Bezier curve on each path', function () {
				getFunnel().draw(getBasicData(), {
					isCurved: true
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
					fillType: 'gradient'
				});

				// Cannot try to re-select the camelCased linearGradient element due to a Webkit bug in the current
				// PhantomJS; workaround is to select the known ID of the linearGradient element
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

		describe('label.fontSize', function () {
			it('should set the label\'s font size to the specified amount', function () {
				getFunnel().draw(getBasicData(), {
					label: {
						fontSize: '16px'
					}
				});

				assert.isTrue(d3.select('#funnel text').attr('style').indexOf('font-size: 16px') > -1);
			});
		});
	});
});
