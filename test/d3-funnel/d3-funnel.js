describe('D3Funnel', function() {
	describe('constructor', function() {
		it('should instantiate without error', function() {
			new D3Funnel('#funnel');
		});
	});

	describe('methods', function() {
		var funnel, getLength;

		beforeEach(function(done) {
			funnel = new D3Funnel('#funnel');
			getLength = function() {
				return d3.select('#funnel').selectAll('svg')[0].length;
			};

			done();
		});

		describe('draw', function() {
			it('should draw simple chart', function() {
				funnel.draw([['Node', 100]], {});

				assert.equal(1, getLength());
			});
		});

		describe('destroy', function() {
			it('should remove a drawn SVG element', function() {
				funnel.draw([['Node', 100]], {});
				funnel.destroy();

				assert.equal(0, getLength());
			});
		});
	});

	describe('options', function() {
		var funnel;

		beforeEach(function(done) {
			funnel = new D3Funnel('#funnel');

			done();
		});

		describe('width', function() {
			it('should set the funnel\'s width to the specified amount', function() {
				funnel.draw([['Node', 100]], {
					width: 200
				});

				assert.equal(200, d3.select('#funnel').selectAll('svg').node().getBBox().width);
			});
		});

		describe('height', function() {
			it('should set the funnel\'s height to the specified amount', function() {
				funnel.draw([['Node', 100]], {
					height: 200
				});

				assert.equal(200, d3.select('#funnel').selectAll('svg').node().getBBox().height);
			});
		});
	});
});
