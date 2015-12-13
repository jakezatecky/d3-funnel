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
});
