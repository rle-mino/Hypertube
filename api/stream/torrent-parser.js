/**
 * Created by opichou on 11/23/16.
 */

import bencode from 'bencode'
import crypto from 'crypto'
import bignum from 'bignum'

module.exports.size = torrent => {
    const size = torrent.info.files ?
        torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
        torrent.info.length;

    return bignum.toBuffer(size, {size: 8});
}

module.exports.infoHash = torrent => {
    const info = bencode.encode(torrent.info);
    return crypto.createHash('sha1').update(info).digest()
}