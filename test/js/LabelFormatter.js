import { assert } from 'chai';

import LabelFormatter from '#js/LabelFormatter.js';

describe('Formatter', () => {
    describe('format', () => {
        it('should pass the label and values to a format function', () => {
            const format = (label, value, formattedValue) => `${label}|${value}|${formattedValue}`;

            assert.equal('Visitors|1500|1.5k', LabelFormatter.format({
                label: 'Visitors',
                value: 1500,
                formattedValue: '1.5k',
            }, format));
        });

        it('should pass a missing formatted value to a format function as null', () => {
            const format = (label, value, formattedValue) => String(formattedValue);

            assert.equal('null', LabelFormatter.format({ label: 'A', value: 1 }, format));
        });

        it('should substitute the label and values into a string format', () => {
            assert.equal('Visitors: 1500 (1.5k)', LabelFormatter.format({
                label: 'Visitors',
                value: 1500,
                formattedValue: '1.5k',
            }, '{l}: {v} ({f})'));
        });

        it('should default the formatted value to the locale-formatted value', () => {
            assert.equal((1500).toLocaleString(), LabelFormatter.format({ label: 'A', value: 1500 }, '{f}'));
        });

        it('should treat `$` patterns in the label and values as plain text', () => {
            assert.equal('Cost $$ $&: $1', LabelFormatter.format({
                label: 'Cost $$ $&',
                value: 1,
                formattedValue: '$1',
            }, '{l}: {f}'));
        });
    });
});
