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
	});
});
