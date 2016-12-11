/**
 * Created by opichou on 11/23/16.
 */
 /* eslint semi: ["error", "never"]*/

import bencode from 'bencode'
import crypto from 'crypto'
import { Uint64BE } from 'int64-buffer'

module.exports.BLOCK_LEN = 2 ** 14

module.exports.ready = torrent => !!torrent.info.files || !!torrent.info.length

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

module.exports.pieceLen = (torrent, pieceIndex) => {
	const size = torrent.xl || torrent.size || 0
	const pieceLength = torrent.info['piece length'] || 0
	const lastPieceLength = size % pieceLength
	const lastPieceIndex = Math.floor(size / pieceLength)

	return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength
}

module.exports.blocksPerPiece = (torrent, pieceIndex) => {
	const pieceLength = this.pieceLen(torrent, pieceIndex)
	return Math.ceil(pieceLength / this.BLOCK_LEN)
}

module.exports.blockLen = (torrent, pieceIndex, blockIndex) => {
	const pieceLength = this.pieceLen(torrent, pieceIndex)

	const lastPieceLength = pieceLength % this.BLOCK_LEN
	const lastPieceIndex = Math.floor(pieceLength / this.BLOCK_LEN)

	return blockIndex === lastPieceIndex ? lastPieceLength : this.BLOCK_LEN
}
