import { assert } from 'chai';

import Formatter from '../../src/d3-funnel/Formatter.js';

describe('Formatter', () => {
    describe('getFormatter', () => {
        it('should return a function format as-is', () => {
            const format = () => 'Custom';

            assert.equal(format, (new Formatter()).getFormatter(format));
        });

        it('should substitute the label and values into a string format', () => {
            const formatter = (new Formatter()).getFormatter('{l}: {v} ({f})');

            assert.equal('Visitors: 1500 (1.5k)', formatter('Visitors', 1500, '1.5k'));
        });

        it('should default the formatted value to the locale-formatted value', () => {
            const formatter = (new Formatter()).getFormatter('{f}');

            assert.equal((1500).toLocaleString(), formatter('Visitors', 1500, null));
        });

        it('should treat `$` patterns in the label and values as plain text', () => {
            const formatter = (new Formatter()).getFormatter('{l}: {f}');

            assert.equal('Cost $$ $&: $1', formatter('Cost $$ $&', 1, '$1'));
        });
    });

    describe('format', () => {
        it('should pass a missing formatted value to the formatter as null', () => {
            const formatter = (label, value, formattedValue) => String(formattedValue);

            assert.equal('null', (new Formatter()).format({ label: 'A', value: 1 }, formatter));
        });
    });
});
