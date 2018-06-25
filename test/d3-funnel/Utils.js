import chai from 'chai';

import Utils from '../../src/d3-funnel/Utils';

const { assert } = chai;

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

    describe('convertLegacyBlock', () => {
        it('should translate a standard legacy block array into an object', () => {
            const block = ['Terran', 200];
            const { label, value } = Utils.convertLegacyBlock(block);

            assert.deepEqual({ label: 'Terran', value: 200 }, { label, value });
        });

        it('should translate a formatted value', () => {
            const block = ['Terran', [200, 'Two Hundred']];
            const { formattedValue } = Utils.convertLegacyBlock(block);

            assert.equal('Two Hundred', formattedValue);
        });

        it('should translate a background color', () => {
            const block = ['Terran', 200, '#e5b81f'];
            const { backgroundColor } = Utils.convertLegacyBlock(block);

            assert.equal('#e5b81f', backgroundColor);
        });

        it('should translate a label color', () => {
            const block = ['Terran', 200, null, '#e5b81f'];
            const { labelColor } = Utils.convertLegacyBlock(block);

            assert.equal('#e5b81f', labelColor);
        });
    });
});
