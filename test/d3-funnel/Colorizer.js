import { assert } from 'chai';

import Colorizer from '../../src/d3-funnel/Colorizer.js';

describe('Colorizer', () => {
    describe('expandHex', () => {
        it('should expand a three character hex code to six characters', () => {
            const hex = 'd33';

            assert.equal('dd3333', (new Colorizer()).expandHex(hex));
        });
    });

    describe('shade', () => {
        it('should brighten a color by the given positive percentage', () => {
            const color = '#000000';

            assert.equal('#222222', (new Colorizer()).shade(color, 2 / 15));
        });

        it('should shade a color by the given negative percentage', () => {
            const color = '#ffffff';

            assert.equal('#dddddd', (new Colorizer()).shade(color, -2 / 15));
        });

        it('should expand a three-character hex', () => {
            const color = '#fff';

            assert.equal('#ffffff', (new Colorizer()).shade(color, 0));
        });
    });

    describe('hexToRg', () => {
        it('should convert a hex value to its RGB value', () => {
            const color = '#007fff';

            assert.deepEqual({ R: 0, G: 127, B: 255 }, (new Colorizer()).hexToRgb(color));
        });

        it('should expand a three-character hex', () => {
            const color = '#d33';

            assert.deepEqual({ R: 221, G: 51, B: 51 }, (new Colorizer()).hexToRgb(color));
        });
    });
});
