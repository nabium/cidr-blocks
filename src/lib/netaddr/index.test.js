import {parse} from './index';

describe('test parse()', () => {

    describe('input pattern ddd.ddd.ddd.ddd', () => {
        test.each([
            ['0.0.0.0', '0.0.0.0'],
            ['01.02.03.04', '1.2.3.4'],
            ['255.255.255.255', '255.255.255.255'],
            ['   1.2.3.4   ', '1.2.3.4'],
        ])('parse(%s)', (source, parsed) => {
            expect(parse(source)).toStrictEqual({result: true, source: parsed, block: {
                address: parsed,
                prelen: 32,
                netmask: '255.255.255.255',
                start: parsed,
                end: parsed,
                numaddr: 1,
            }});
        });

        test.each([
            ['', 'Input did not match any of the recognized formats.'],
            ['a.0.0.0', 'Input did not match any of the recognized formats.'],
            ['01.02.03.256', 'IP address is malformed.'],
            ['1.4294967296.3.4', 'IP address is malformed.'],
        ])('parse(%s) throws', (source, message) => {
            expect(parse(source)).toStrictEqual({result: false, message});
        });
    });

    describe('input pattern ddd.ddd.ddd.ddd/dd', () => {
        test.each([
            ['0.0.0.0/32', {result: true, source: '0.0.0.0/32', block: {
                address: '0.0.0.0',
                prelen: 32,
                netmask: '255.255.255.255',
                start: '0.0.0.0',
                end: '0.0.0.0',
                numaddr: 1,
            }}],
            ['255.255.255.255/32', {result: true, source: '255.255.255.255/32', block: {
                address: '255.255.255.255',
                prelen: 32,
                netmask: '255.255.255.255',
                start: '255.255.255.255',
                end: '255.255.255.255',
                numaddr: 1,
            }}],
            ['0.0.0.0/0', {result: true, source: '0.0.0.0/0', block: {
                address: '0.0.0.0',
                prelen: 0,
                netmask: '0.0.0.0',
                start: '0.0.0.0',
                end: '255.255.255.255',
                numaddr: 4294967296,
            }}],
            ['255.255.255.255/0', {result: true, source: '255.255.255.255/0', block: {
                address: '255.255.255.255',
                prelen: 0,
                netmask: '0.0.0.0',
                start: '0.0.0.0',
                end: '255.255.255.255',
                numaddr: 4294967296,
            }}],
        ])('parse(%s)', (source, expected) => {
            expect(parse(source)).toStrictEqual(expected);
        });
    });
});
