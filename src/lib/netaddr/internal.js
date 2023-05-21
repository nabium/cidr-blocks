export function isValidByte(value, maxval) {
    return Number.isInteger(value) && 0 <= value && value <= maxval;
}

export function parseByte(value, maxval=255) {
    const num = parseInt(value, 10);
    if (isValidByte(num, maxval)) {
        return num;
    } else {
        return NaN;
    }
}

export function str2intval(s1, s2, s3, s4) {
    const b1 = parseByte(s1);
    const b2 = parseByte(s2);
    const b3 = parseByte(s3);
    const b4 = parseByte(s4);

    if (isNaN(b1) || isNaN(b2) || isNaN(b3) || isNaN(b4)) {
        return NaN;
    }

    return (b1 << 24) + (b2 << 16) + (b3 << 8) + b4;
}

export function intval2str(intval) {
    return `${(intval >>> 24) & 0xff}.${(intval >>> 16) & 0xff}.${(intval >>> 8) & 0xff}.${intval & 0xff}`
}

export function netval2prelen(netval) {
    let prelen = 0;
    while (netval !== 0) {
        if ((netval & 0x80000000) !== 0) {
            prelen += 1;
            netval = netval << 1;
        } else {
            return NaN;
        }
    }
    return prelen;
}

export function prelen2netval(prelen) {
    if (!Number.isInteger(prelen) || prelen < 0 || 32 < prelen) {
        return NaN;
    } else if (prelen === 0) {
        // expected:
        // (0xffffffff >>> (32 - 0)) = 0
        // but was:
        // (0xffffffff >>> (32 - 0)) = 4294967295
        return 0;
    } else {
        return (0xffffffff >>> (32 - prelen)) << (32 - prelen);
    }
}

export function findMostCommonPrelen(fromval, toval) {

    if (!Number.isInteger(fromval) || !Number.isInteger(toval)) {
        return NaN;
    }

    let prelen = 0;
    while (prelen < 32) {
        if ((fromval & 0x80000000) === (0x80000000 & toval)) {
            fromval <<= 1;
            toval <<= 1;
            prelen += 1;
        } else {
            break;
        }
    }

    return prelen;
}

export function prelenFromIntval(intval) {
    let hostlen = 0;
    while (hostlen < 32) {
        if ((intval & 0x01) === 0) {
            intval >>= 1;
            hostlen += 1;
        } else {
            break;
        }
    }

    return 32 - hostlen;
}

export function cmpAsUint32(lhs, rhs) {
    const lhs1 = lhs >>> 16;
    const rhs1 = rhs >>> 16;
    const lhs2 = lhs & 0x0000ffff;
    const rhs2 = rhs & 0x0000ffff;

    if (lhs1 < rhs1) {
        return -1;
    } else if (lhs1 > rhs1) {
        return 1;
    } else if (lhs2 < rhs2) {
        return -1;
    } else if (lhs2 > rhs2) {
        return 1;
    } else {
        return 0;
    }
}
