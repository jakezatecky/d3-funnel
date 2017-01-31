import chai from 'chai';

import uniqueDomId from '../../src/d3-funnel/uniqueDomId';

const assert = chai.assert;

describe('uniqueDomId', () => {
	it('should generate a new unique DOM id for each call', () => {
		assert.notEqual(uniqueDomId(), uniqueDomId());
	});

	it('should skip over existing DOM IDs', () => {
		const idParts = uniqueDomId().split('-');
		const lastId = parseInt(idParts[idParts.length - 1], 10);

		const sandbox = document.querySelector('#sandbox');

		// Add multiple IDs to the DOM
		for (let i = 0; i < 5; i += 1) {
			const span = document.createElement('span');

			span.id = uniqueDomId();

			sandbox.appendChild(span);
		}

		// uniqueDomId() has been called 5 times, so the next call should be
		// 6 away from the first
		assert.equal(`unique-${lastId + 6}`, uniqueDomId());
	});

	it('should generate a unique DOM ID based on the supplied prefix', () => {
		assert.notEqual('jim-raynor-0', uniqueDomId('jim-raynor'));
	});
});
