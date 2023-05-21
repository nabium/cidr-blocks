import {parseByte, str2intval, intval2str, netval2prelen, prelen2netval, findMostCommonPrelen, prelenFromIntval, cmpAsUint32} from './internal';

function parseIpaddr(source) {
    const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;

    const trimmed = source.trim();
    const found = trimmed.match(re);

    if (found === null) {
        return null;
    }

    const intval = str2intval(found[1], found[2], found[3], found[4]);

    if (isNaN(intval)) {
        throw Error('IP address is malformed.');
    }

    return {
        source: intval2str(intval),
        block: cleanBlock(fillBlock({intval, prelen: 32})),
    };
}

function parseCidr(source) {
    const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/;

    const trimmed = source.trim();
    const found = trimmed.match(re);

    if (found === null) {
        return null;
    }

    const intval = str2intval(found[1], found[2], found[3], found[4]);
    const prelen = parseByte(found[5], 32);

    if (isNaN(intval)) {
        throw Error('IP address is malformed.');        
    } else if (isNaN(prelen)) {
        throw Error('Prefix length should be 0-32.');
    }

    return {
        source: `${intval2str(intval)}/${prelen}`,
        block: cleanBlock(fillBlock({intval, prelen})),
    };
}

function parseIpAndNetmask(source) {
    const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\s+netmask\s+(\d+)\.(\d+)\.(\d+)\.(\d+)$/;

    const trimmed = source.trim();
    const found = trimmed.match(re);

    if (found === null) {
        return null;
    }

    const intval = str2intval(found[1], found[2], found[3], found[4]);
    const netval = str2intval(found[5], found[6], found[7], found[8]);

    if (isNaN(intval)) {
        throw Error('IP address is malformed.');        
    } else if (isNaN(netval)) {
        throw Error('Netmask is malformed.');        
    }

    const prelen = netval2prelen(netval);

    if (isNaN(prelen)) {
        throw Error('Netmask is invalid.');
    }

    return {
        source: `${intval2str(intval)} netmask ${intval2str(netval)}`,
        block: cleanBlock(fillBlock({intval, prelen})),
    };
}

function parseIpIp(source) {
    const re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)\s*-\s*(\d+)\.(\d+)\.(\d+)\.(\d+)$/;

    const trimmed = source.trim();
    const found = trimmed.match(re);

    if (found === null) {
        return null;
    }

    const fromval = str2intval(found[1], found[2], found[3], found[4]);
    const toval = str2intval(found[5], found[6], found[7], found[8]);

    if (isNaN(fromval)) {
        throw Error('First IP address is malformed.');
    } else if (isNaN(toval)){
        throw Error('Second IP address is malformed.');        
    } else if (cmpAsUint32(fromval, toval) > 0) {
        throw Error('First IP address must be same as or precede second IP address.');
    }

    const wholeblock = findContainingBlock(fromval, toval);

    let additional = undefined;
    if (wholeblock.startval !== fromval || wholeblock.endval !== toval) {
        additional = findExactBlocks(fromval, toval);
    }

    return {
        source: `${intval2str(fromval)}-${intval2str(toval)}`,
        block: cleanBlock(wholeblock),
        additional,
    }
}

function findContainingBlock(fromval, toval) {
    let prelen = findMostCommonPrelen(fromval, toval);

    do {
        const block = fillBlock({intval: fromval, prelen});
        if (cmpAsUint32(toval, block.endval) <= 0) {
            return block;
        } else {
            prelen -= 1;
        }

    } while (0 <= prelen);

    throw Error(`findContainingBlock(${fromval}, ${toval}): prelen(${prelen}) < 0`);
}

function findExactBlocks(fromval, toval) {
    const blocks = [];

    let current = fromval;
    do {
        const found = findFirstBlock(current, toval);
        const endval = found.endval;
        blocks.push(cleanBlock(found));

        if (endval === toval) {
            return blocks;
        } else {
            current = endval + 1;
        }
    } while (cmpAsUint32(current, toval) <= 0);

    throw Error(`findExactBlocks(${fromval}, ${toval}): toval < current(${current}), blocks=${JSON.stringify(blocks)}`);
}

function findFirstBlock(fromval, toval) {
    let prelen = prelenFromIntval(fromval);
    do {
        const block = fillBlock({intval: fromval, prelen});
        if (cmpAsUint32(block.endval, toval) <= 0) {
            return block;
        } else {
            prelen += 1;
        }
    } while (prelen <= 32);

    throw Error(`findFirstBlock(${fromval}, ${toval}): 32 < prelen(${prelen})`);
}

function fillBlock(block) {
    block.netval = prelen2netval(block.prelen);

    block.startval = block.intval & block.netval;

    if (block.prelen === 32) {
        block.endval = block.intval;
    } else {
        block.endval = block.intval | (0xffffffff >>> block.prelen);
    }

    block.address = intval2str(block.intval);
    block.netmask = intval2str(block.netval);
    block.start = intval2str(block.startval);
    block.end = intval2str(block.endval);

    block.numaddr = 2 ** (32 - block.prelen);

    return block;
}

function cleanBlock(block) {
    delete block.intval;
    delete block.startval;
    delete block.endval;
    delete block.netval;
    return block;
}

function parse(source) {
    try {
        // ddd.ddd.ddd.ddd
        let ret = parseIpaddr(source);

        // ddd.ddd.ddd.ddd/dd
        if (ret === null) {
            ret = parseCidr(source);
        }

        // ddd.ddd.ddd.ddd netmask ddd.ddd.ddd.ddd
        if (ret === null) {
            ret = parseIpAndNetmask(source);
        }

        // ddd.ddd.ddd.ddd-ddd.ddd.ddd.ddd
        if (ret === null) {
            ret = parseIpIp(source);
        }

        if (ret !== null ) {
            return {
                result: true,
                ...ret
            };
        } else {
            return {
                result: false,
                message: 'Input did not match any of the recognized formats.',
            }
        }
    } catch (err) {
        if (err instanceof Error) {
            return {
                result: false,
                message: err.message,
            };
        } else {
            return {
                result: false,
                message: JSON.stringify(err),
            };
        }
    }
}

export { parse };
