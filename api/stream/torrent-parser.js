/**
 * Created by opichou on 11/23/16.
 */
 /* eslint semi: ["error", "never"]*/

import bencode from 'bencode'
import crypto from 'crypto'
import { Uint64BE } from 'int64-buffer'

module.exports.size = torrent => {
	if (torrent.xl) {
		const long = new Uint64BE(torrent.xl)
		return long.toBuffer()
	} else if (torrent.size) {
		const long = new Uint64BE(torrent.size)
		return long.toBuffer()
	}
		const size = torrent.info.files ?
        torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
        torrent.info.length
		const long = new Uint64BE(size)
		return long.toBuffer()

}

module.exports.infoHash = torrent => {
	if (torrent.infoHash) {
		return torrent.infoHashBuffer
	}
    const info = bencode.encode(torrent.info)
    return Buffer.from(crypto.createHash('sha1').update(info).digest())
}
