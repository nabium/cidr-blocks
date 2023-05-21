import {
    isValidByte,
    parseByte,
    str2intval,
    intval2str,
    netval2prelen,
    prelen2netval,
    findMostCommonPrelen,
    prelenFromIntval,
    cmpAsUint32,
} from './internal';

test.each([
    [-1, 255, false],
    [0, 255, true],
    [255, 255, true],
    [256, 255, false],
    [-1, 32, false],
    [0, 32, true],
    [32, 32, true],
    [33, 32, false],
])('test isValidByte(%i, %i)', (value, maxval, expected) => {
    expect(isValidByte(value, maxval)).toBe(expected);
});

test.each([
    ['-1', 255, NaN],
    ['0', 255, 0],
    ['255', 255, 255],
    ['256', 255, NaN],
    ['-1', undefined, NaN],
    ['0', undefined, 0],
    ['255', undefined, 255],
    ['256', undefined, NaN],
    ['-1', 32, NaN],
    ['0', 32, 0],
    ['32', 32, 32],
    ['33', 32, NaN],
    ['010', undefined, 10],
    [undefined, undefined, NaN],
    [null, undefined, NaN],
    [NaN, undefined, NaN],
    ['abc', undefined, NaN],
    ['0x10', undefined, 0],
    ['123abc', undefined, 123],
])('test parseByte(%s, %i)', (value, maxval, expected) => {
    expect(parseByte(value, maxval)).toBe(expected);
});

test.each([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1],
    [1, 2, 3, 4, 16909060],
    [127, 255, 255, 255, 2147483647],
    [128, 0, 0, 0, -2147483648],
    [255, 255, 255, 255, -1],
    [256, 0, 0, 0, NaN],
    [0, -1, 0, 0, NaN],
    [0, 0, 'a', 0, NaN],
    [0, 0, 0, undefined, NaN],
])('test str2intval(%s, %s, %s, %s)', (s1, s2, s3, s4, expected) => {
    expect(str2intval(s1, s2, s3, s4)).toBe(expected);
});

test.each([
    [0, '0.0.0.0'],
    [1, '0.0.0.1'],
    [16909060, '1.2.3.4'],
    [2147483647, '127.255.255.255'],
    [-2147483648, '128.0.0.0'],
    [-1, '255.255.255.255'],
    [NaN, '0.0.0.0'],
])('test intval2str(%i)', (intval, expected) => {
    expect(intval2str(intval)).toBe(expected);
});

test.each([
    [str2intval('0', '0', '0', '0'), 0],
    [str2intval('128', '0', '0', '0'), 1],
    [str2intval('254', '0', '0', '0'), 7],
    [str2intval('255', '0', '0', '0'), 8],
    [str2intval('255', '128', '0', '0'), 9],
    [str2intval('255', '255', '0', '0'), 16],
    [str2intval('255', '255', '128', '0'), 17],
    [str2intval('255', '255', '255', '0'), 24],
    [str2intval('255', '255', '255', '128'), 25],
    [str2intval('255', '255', '255', '255'), 32],
    [NaN, NaN],
    [str2intval('0', '255', '0', '0'), NaN],
    [str2intval('253', '0', '0', '0'), NaN],
    [str2intval('255', '129', '0', '0'), NaN],
    [str2intval('255', '255', '1', '0'), NaN],
    [str2intval('255', '255', '255', '129'), NaN],
])('test netval2prelen(%i)', (netval, expected) => {
    expect(netval2prelen(netval)).toBe(expected);
});

test.each([
    [0, str2intval('0', '0', '0', '0')],
    [1, str2intval('128', '0', '0', '0')],
    [7, str2intval('254', '0', '0', '0')],
    [8, str2intval('255', '0', '0', '0')],
    [9, str2intval('255', '128', '0', '0')],
    [16, str2intval('255', '255', '0', '0')],
    [17, str2intval('255', '255', '128', '0')],
    [24, str2intval('255', '255', '255', '0')],
    [25, str2intval('255', '255', '255', '128')],
    [32, str2intval('255', '255', '255', '255')],
    [NaN, NaN],
    [-1, NaN],
    [33, NaN],
])('test prelen2netval(%i)', (prelen, expected) => {
    expect(prelen2netval(prelen)).toBe(expected);
});

test.each([
    [0, 0, 32],
    [0, -1, 0],
    [-1, -1, 32],
    [0, 2147483647, 1],
    [0, -2147483648, 0],
    [2147483647, -2147483648, 0],
    [-2147483648, -1, 1],
    [2147483647, -1, 0],
    [0xCBCBbbCB, 0xCBCBCBCB, 17],
    [0xCBCBCBCB, 0xCBCBCBCB, 32],
])('test findMostCommonPrelen(%i, %i)', (fromval, toval, expected) => {
    expect(findMostCommonPrelen(fromval, toval)).toBe(expected);
});

test.each([
    [0, 0],
    [-2147483648, 1],
    [0x00000100, 24],
    [0x00000002, 31],
    [0x00000001, 32],
    [-1, 32],
])('test prelenFromIntval(%i)', (intval, expected) => {
    expect(prelenFromIntval(intval)).toBe(expected);
});

test.each([
    [0, 0, 0],
    [-1, 0, 1],
    [0, -1, -1],
    [-2147483648, 0, 1],
    [0, -2147483648, -1],
    [-2147483648, -1, -1],
    [-1, -2147483648, 1],
    [2147483647, -2147483648, -1],
    [-2147483648, 2147483647, 1],
    [-2147483648, -2147483648, 0],
    [2147483647, 2147483647, 0],
    [1, 2, -1],
    [2, 1, 1],
    [1, 1, 0],
    [0x10000, 0x20000, -1],
    [0x20000, 0x10000, 1],
    [0x10001, 0x10001, 0],
])('test cmpAsUint32(%i, %i)', (lhs, rhs, expected) => {
    expect(cmpAsUint32(lhs, rhs)).toBe(expected);
});
