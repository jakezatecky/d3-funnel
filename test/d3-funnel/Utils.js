import { assert } from 'chai';

import Utils from '../../src/d3-funnel/Utils.js';

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

        it('should merge nested objects', () => {
            const a = {
                label: { fill: '#fff', fontSize: '14px' },
            };

            const b = {
                label: { fontSize: '18px' },
            };

            assert.deepEqual({ label: { fill: '#fff', fontSize: '18px' } }, Utils.extend(a, b));
        });

        it('should copy nested objects rather than share them', () => {
            const a = {
                label: { fill: '#fff' },
            };
            const b = {
                tooltip: { enabled: true },
            };

            const merged = Utils.extend(a, b);

            merged.label.fill = '#000';
            merged.tooltip.enabled = false;

            assert.equal('#fff', a.label.fill);
            assert.isTrue(b.tooltip.enabled);
        });

        it('should handle empty objects', () => {
            assert.deepEqual({}, Utils.extend({}, {}));
        });
    });
});
