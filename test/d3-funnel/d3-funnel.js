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
});
