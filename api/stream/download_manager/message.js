/* eslint semi: ["error", "never"]*/
import bencode from 'bencode'
import anon from '../anonymizer'


module.exports.buildHandshake = (torrent, ext) => {
	const buf = Buffer.alloc(68)

	buf.writeUInt8(19, 0)
	buf.write('BitTorrent protocol', 1)
	buf.writeUInt32BE(0, 20)
	if (ext) {
		buf.writeUInt32BE(1048576, 24)
	} else {
		buf.writeUInt32BE(0, 24)
	}

	torrent.infoHashBuffer.copy(buf, 28)
	buf.write(anon.nodeId(), 44)
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
	return buf
}

module.exports.buildRequest = payload => {
	const buf = Buffer.alloc(17)
	buf.writeUInt32BE(13, 0)
	buf.writeUInt(6, 4)
	buf.writeUInt32BE(payload.index, 5)
	buf.writeUInt32BE(payload.begin, 9)
	buf.writeUInt32BE(payload.length, 13)
	return buf
}

module.exports.buildPiece = payload => {
	const buf = Buffer.alloc(payload.block.length + 13)
	buf.writeUInt32BE(payload.block.length + 9, 0)
	buf.writeUInt(7, 4)
	buf.writeUInt32BE(payload.index, 5)
	buf.writeUInt32BE(payload.begin, 9)
	payload.block.copy(buf, 13)
	return buf
}

module.exports.fastParse = (msg) => {
	const id = msg.length > 4 ? msg.readInt8(4) : null
	const size = msg.readUInt32BE(0)
	const extId = msg.readUInt8(5)
	const reservedByte = msg.slice(size + 1, 8)
	const infoHash = msg.slice(size + 9, 20)
	const peerId = msg.slice(size + 29, 20)
	const payload = msg.slice(1, size)
	return { id, extId, size, reservedByte, infoHash, peerId, payload }
}

module.exports.buileExtRequest = (torrent, piece, id) => {
	const newMsg = { msg_type: 0, piece }
	const msg = bencode.encode(newMsg)
	const size = msg.length
	const buf = Buffer.alloc(size + 54)
	buf.writeUInt32BE(size + 6, 0)
	buf.writeUInt8(20, 4)
	buf.writeUInt8(id, 5)
	buf.write(msg, 6)
	buf.writeUInt32BE(0, size + 6)
	buf.writeUInt32BE(1048576, size + 10)
	torrent.infoHashBuffer.copy(buf, size + 14)
	buf.write(anon.nodeId(), size + 34)
	return buf
}

module.exports.verify = (torrent, info) => {
	return true
}

module.exports.torrentInfoParser = info => {
	console.log(info)
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
