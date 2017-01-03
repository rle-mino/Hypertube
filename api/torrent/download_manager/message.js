/* eslint semi: ["error", "never"]*/
import bencode from 'bencode'
import { Uint64BE } from 'int64-buffer'
import crypto from 'crypto'
import anon from '../lib/anonymizer'

module.exports.buildHandshake = (torrent, ext) => {
	const buf = Buffer.alloc(68)
	buf.writeUInt8(19, 0)
	buf.write('BitTorrent protocol', 1)
	if (ext) {
		const big = new Uint64BE(1048576)
		big.toBuffer().copy(buf, 20)
	} else {
		buf.writeUInt32BE(0, 20)
		buf.writeUInt32BE(0, 24)
	}
	torrent.infoHashBuffer.copy(buf, 28)
	anon.nodeId().copy(buf, 48)
	return buf
}

module.exports.keepAlive = client => {
	const buf = Buffer.alloc(4)
	client.write(buf)
}

module.exports.buildExtRequest = (id, msg) => {
	const size = Buffer.byteLength(msg) + 2
	const buf = Buffer.alloc(size + 4)
	buf.writeUInt32BE(size, 0)
	buf.writeUInt8(20, 4)
	buf.writeUInt8(id, 5)
	msg.copy(buf, 6)
	return buf
}

module.exports.buildKeepAlive = () => Buffer.alloc(4)

module.exports.buildChoke = () => {
	const buf = Buffer.alloc(5)
	buf.writeUInt32BE(1, 0)
	buf.writeUInt8(0, 4)
	return buf
}

module.exports.buildUnchoke = () => {
	const buf = Buffer.alloc(5)
	buf.writeUInt32BE(1, 0)
	buf.writeUInt8(1, 4)
	return buf
}

module.exports.buildInterested = () => {
	const buf = Buffer.alloc(5)
	buf.writeUInt32BE(1, 0)
	buf.writeUInt8(2, 4)
	return buf
}

module.exports.buildUninterested = () => {
	const buf = Buffer.alloc(5)
	buf.writeUInt32BE(1, 0)
	buf.writeUInt8(3, 4)
	return buf
}

module.exports.buildHave = payload => {
	const buf = Buffer.alloc(9)
	buf.writeUInt32BE(5, 0)
	buf.writeUInt8(4, 4)
	buf.writeUInt32BE(payload, 5)
	return buf
}

module.exports.buildBitfield = bitfield => {
	const buf = Buffer.alloc(14)
	buf.writeUInt32BE(bitfield.length + 1, 0)
	buf.writeUInt8(5, 4)
	bitfield.copy(buf, 5)
	// buf.write(bitfield, 'binary')
	return buf
}

module.exports.buildRequest = payload => {
	const buf = Buffer.alloc(17)
	buf.writeUInt32BE(13, 0)
	buf.writeUInt8(6, 4)
	buf.writeUInt32BE(payload.index, 5)
	buf.writeUInt32BE(payload.begin, 9)
	buf.writeUInt32BE(payload.length, 13)
	return buf
}

module.exports.buildPiece = payload => {
	const buf = Buffer.alloc(payload.block.length + 13)
	buf.writeUInt32BE(payload.block.length + 9, 0)
	buf.writeUInt8(7, 4)
	buf.writeUInt32BE(payload.index, 5)
	buf.writeUInt32BE(payload.begin, 9)
	payload.block.copy(buf, 13)
	return buf
}

module.exports.verify = (torrent, info) => {
	return (crypto.createHash('sha1').update(info).digest('hex') === torrent.infoHash)
}

module.exports.buildCancel = payload => {
	const buf = Buffer.alloc(17)
	buf.writeUInt32BE(13, 0)
	buf.writeUInt8(8, 4)
	buf.writeUInt32BE(payload.index, 5)
	buf.writeUInt32BE(payload.begin, 9)
	buf.writeUInt32BE(payload.length, 13)
	return buf
}

module.exports.buildPort = payload => {
	const buf = Buffer.alloc(7)
	buf.writeUInt32BE(3, 0)
	buf.writeUInt8(9, 4)
	buf.writeUInt16BE(payload, 5)
	return buf
}

module.exports.parse = msg => {
	const id = msg.length > 4 ? msg.readInt8(4) : null
	let payload = msg.length > 5 ? msg.slice(5) : null
	if (id === 6 || id === 7 || id === 8) {
		const rest = payload.slice(8)
		payload = {
			index: payload.readInt32BE(0),
			begin: payload.readInt32BE(4),
		}
		payload[id === 7 ? 'block' : 'length'] = rest
	}

	return {
		size: msg.readInt32BE(0),
		id,
		payload,
	}
}

module.exports.fastParse = (msg) => {
	const ret = {}
	if (msg.length > 6) {
		ret.size = msg.readUInt32BE(0)
		ret.Id = msg.readUInt8(4)
		ret.extId = msg.readUInt8(5)
		ret.payload = msg.slice(6)
	}
	return ret
}
