import chai from 'chai';

import Navigator from '../../src/d3-funnel/Navigator';

const assert = chai.assert;

describe('Navigator', () => {
	describe('plot', () => {
		it('should concatenate a list of path commands together', () => {
			const commands = [
				['M', 0, 15],
				['', 5, 25],
			];

			assert.equal('M0,15 5,25', (new Navigator()).plot(commands));
		});
	});
});
