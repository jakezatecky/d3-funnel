import chai from 'chai';

import Utils from '../../src/d3-funnel/Utils';

const assert = chai.assert;

describe('Utils', () => {
	describe('extend', () => {
		it('should override object a with the properties of object b', () => {
			const a = {
				name: 'Fluoride',
			};

			const b = {
				name: 'Argon',
				atomicNumber: 18,
			};

			assert.deepEqual(b, Utils.extend(a, b));
		});

		it('should add properties of object b to object a', () => {
			const a = {
				name: 'Alpha Centauri',
			};

			const b = {
				distanceFromSol: 4.37,
				stars: [{
					name: 'Alpha Centauri A',
				}, {
					name: 'Alpha Centauri B',
				}, {
					name: 'Proxima Centauri',
				}],
			};

			const merged = {
				name: 'Alpha Centauri',
				distanceFromSol: 4.37,
				stars: [{
					name: 'Alpha Centauri A',
				}, {
					name: 'Alpha Centauri B',
				}, {
					name: 'Proxima Centauri',
				}],
			};

			assert.deepEqual(merged, Utils.extend(a, b));
		});
	});
});
