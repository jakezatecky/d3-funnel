import chai from 'chai';

import Colorizer from '../../src/d3-funnel/colorizer';

const assert = chai.assert;

describe('Colorizer', function () {
	describe('expandHex', function () {
		it('should expand a three character hex code to six characters', function () {
			const hex = 'd33';

			assert.equal('dd3333', Colorizer.expandHex(hex));
		});
	});

	describe('shade', function () {
		it('should brighten a color by the given positive percentage', function () {
			const color = '#000000';

			assert.equal('#222222', (new Colorizer).shade(color, 2 / 15));
		});

		it('should shade a color by the given negative percentage', function () {
			const color = '#ffffff';

			assert.equal('#dddddd', (new Colorizer).shade(color, -2 / 15));
		});

		it('should expand a three-character hex', function () {
			const color = '#fff';

			assert.equal('#ffffff', (new Colorizer).shade(color, 0));
		});
	});
});
