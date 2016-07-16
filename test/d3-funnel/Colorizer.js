import chai from 'chai';

import Colorizer from '../../src/d3-funnel/Colorizer';

const assert = chai.assert;

describe('Colorizer', () => {
	describe('expandHex', () => {
		it('should expand a three character hex code to six characters', () => {
			const hex = 'd33';

			assert.equal('dd3333', (new Colorizer).expandHex(hex));
		});
	});

	describe('shade', () => {
		it('should brighten a color by the given positive percentage', () => {
			const color = '#000000';

			assert.equal('#222222', (new Colorizer).shade(color, 2 / 15));
		});

		it('should shade a color by the given negative percentage', () => {
			const color = '#ffffff';

			assert.equal('#dddddd', (new Colorizer).shade(color, -2 / 15));
		});

		it('should expand a three-character hex', () => {
			const color = '#fff';

			assert.equal('#ffffff', (new Colorizer).shade(color, 0));
		});
	});
});
