/* eslint semi: ["error", "never"]*/
import net from 'net'
import fs from 'fs'
import path from 'path'
import bencode from 'bencode'
import uniq from 'uniq'
import tp from './torrent-parser'
import message from './message'
import log from '../lib/log'
import Pieces from './Pieces'
import Queue from './Queue'
// import utMetadataExt from './extension/ut_metadata'

const MAX_ACCEPTED_SIZE = 10000000
const MAX_CONNEXIONS_LIMIT = 2000

function Downloader(torrent, peers) {
	if (!(this instanceof Downloader)) return new Downloader(torrent, peers)
	const self = this
	this.metaId = 2
	this.torrent = torrent
	this.metaDataSize = 0
	this._connexions = 0
	this._handshakes = []
	this.peers = []
	this.state = 'building'
	if (torrent && torrent.info && torrent.info.pieces) {
		self.size = torrent.info.pieces.length / 20
		self.pieces = new Pieces(torrent)
	} else {
		self.size = 0
	}
	this.file = fs.openSync(`${torrent.name}`, 'w')
	if (peers) this.addPeers(peers)
}

Downloader.prototype.addPeers = function (peers) {
	this.peers = [...peers, ...this.peers]
	uniq(this.peers)
	if (this.state !== 'downloading' && this.state !== 'saturated') {
		this.startDownloading()
	}
}

Downloader.prototype.startDownloading = function () {
	this.state = 'downloading'
	this.callInterval = setInterval(() => {
		if (this._connexions > MAX_CONNEXIONS_LIMIT) {
			clearInterval(this.callInterval)
			this.state = 'saturated'
			console.log('Peers number limit reeched in current swarm')
		} else if (this.peers.length > 0) {
			this._connexions += 1
			const peer = this.peers.pop()
			this.download(peer, this.torrent, this.pieces, this.torrent && !this.torrent.info)
		}
	}, 1000)
}

Downloader.prototype.download = function (peer, torrent, pieces, ext) {
	const self = this
	const client = new net.Socket()
	client.setKeepAlive(true, 120000)
	client.on('error', () => {})
	client.connect(peer.port, peer.ip, () => {
		client.write(message.buildHandshake(torrent, ext))
		if (ext) {
			const extHandshake = bencode.encode({
				m: {
					ut_metadata: self.metaId,
				},
				metadata_size: self.metadataSize || 0,
				p: client.localPort,
			})
			client.write(message.buildExtRequest(0, extHandshake))
		} else {
			this.sendBitfield(client, this.pieces)
		}
		this.keepAlive(client)
	})
	const queue = new Queue(torrent)
	this.onWholeMsg(client, msg => this.msgHandler(msg, client, pieces, queue))
}

Downloader.prototype.msgHandler = function (msg, client, pieces, queue) {
	if (!pieces && this.torrent.info) {
		pieces = this.pieces
	}
	if (this.torrent.magnet
		&& !this.torrent.info
		&& msg.length > 4
		&& msg.readUInt8(4) === 20) {
		this.extendedHandler(client, pieces, queue, msg)
	} else if (this.isHandshake(msg)) {
		if (this.torrent.info) {
			client.write(message.buildInterested())
		}
	} else if (this.torrent.info) {
		const m = message.parse(msg)
		switch (m.id) {
			case 0: this.chokeHandler(client)
			break
			case 1: this.unchokeHandler(client, pieces, queue)
			break
			case 4: this.haveHandler(client, pieces, queue, m.payload)
			break
			case 5: this.bitfieldHandler(client, pieces, queue, m.payload)
			break
			case 7: this.pieceHandler(client, pieces, queue, m.payload)
			break
			case 9: this.handlePieceRequest(client, m.payload)
			default: break
		}
	} else {
		this._handshakes.push({ msg, client, pieces, queue })
	}
}

Downloader.prototype.extendedHandler = function (client, pieces, queue, msg) {
	const extMessage = message.fastParse(msg)
	const str = extMessage.payload.toString('binary')
	const trailerIndex = str.indexOf('ee') + 2
	let payload = {}
	try {
		payload = bencode.decode(extMessage.payload)
	} catch (e) {
		console.log(e)
	}
	const trailer = msg.slice(trailerIndex + 6)
	const msgType = payload.msg_type
	if (extMessage.extId === 0) {
		this.handleExtHandshake(client, pieces, queue, payload)
	} else if (extMessage.extId === this.metaId) {
		try {
			payload = bencode.decode(extMessage.payload.slice(0, trailerIndex))
		} catch (e) {
			console.log(e)
		}
		switch (msgType) {
			case 1: this.handleExtPiece(payload, trailer)
			break
			case 0: this.handleExtQuery(client, payload)
			break
			case 2: this.handleExtReject(client)
			break
			default: console.log('Unhadled Extended message')
			break
		}
	}
}

Downloader.prototype.handlePieceRequest = function(client, msg) {
	console.log(client.remoteAddress, 'Piece request')
	const { index, begin, length }	= msg
	const pLen						= index > 0
		? (index - 1) * this.torrent.info['piece length']
		: 0
	const block						= Buffer.alloc(length)

	if (!this.pieces.received[index][Math.floor(begin / tp.BLOCK_LEN)]) return
	fs.read(this.file, block, 0, length, pLen + begin, () => {})
	client.write(message.buildPiece({ index, begin, block }))
}

Downloader.prototype.sendBitfield = (client, pieces) => {
	client.write(message.buildBitfield(pieces.piecesBitfield()))
}

Downloader.prototype.keepAlive = vlient => {
	setInterval(message.keepAlive, 119999, client)
}

Downloader.prototype.doDownload = function () {
	this._handshakes.forEach(h => {
		const { msg, client, pieces, queue } = h
		this.msgHandler(msg, client, pieces, queue)
	})
}

Downloader.prototype.onWholeMsg = (client, callback) => {
	let savedBuf = Buffer.alloc(0)
	let handshake = true

	client.on('data', resBuf => {
		const msgLen = () => { return handshake ?
			savedBuf.readUInt8(0) +
			49 :
			savedBuf.readUInt32BE(0) + 4 }
		savedBuf = Buffer.concat([savedBuf, resBuf], savedBuf.length + resBuf.length)

		while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
			callback(savedBuf.slice(0, msgLen()))
			savedBuf = savedBuf.slice(msgLen())
			handshake = false
		}
	})
}

Downloader.prototype.isHandshake = function (msg) {
	return (msg.length === msg.readUInt8(0) + 49 &&
		msg.toString('utf8', 1, 20) === 'BitTorrent protocol')
}

Downloader.prototype.isExtended = function (msg) {
	const size = msg.readUInt8(0)
	return msg.slice(size + 1, size + 9)[5] === 16
}

Downloader.prototype.handleExtHandshake = function (client, pieces, queue, payload) {
	const utMetadata = payload.m && payload.m.ut_metadata
	const metadataSize = payload.metadata_size
	// this.metaDataSize = metadataSize
	if (utMetadata && metadataSize && metadataSize > 0
		&& metadataSize < MAX_ACCEPTED_SIZE) {
		if (!this.metaPieces) {
			this.metaPieces = new Array(Math.ceil(metadataSize / 16384))
			this.metaPieces.fill(0)
		}
		for (let i = 0; i < this.metaPieces.length; i += 1) {
			if (this.metaPieces[i] === 0) {
				const req = bencode.encode({ msg_type: 0, piece: i })
				client.write(message.buildExtRequest(utMetadata, req))
			}
		}
	}
}
Downloader.prototype.handleExtPiece = function (payload, trailer) {
	const piece = trailer
	this.metaPieces[payload.piece] = piece
	if (!this.torrent.info && this.metaPieces.every(e => e !== 0)) {
		let info = null
		try {
			const buf = Buffer.concat(this.metaPieces)
			info = bencode.decode(buf)
			if (message.verify(this.torrent, bencode.encode(info))) {
				console.log('metadata fetched, downloading...')
				this.torrent.info = info
				this.size = info.pieces.length / 20
				this.pieces = new Pieces(this.torrent)
				this.doDownload()
			} else {
				console.log('hash error')
			}
		} catch (e) {
			console.log(e)
		}
	}
}
Downloader.prototype.handleExtQuery = function (client, payload) {
	console.log('unhandled metadata request')
	// this should send piece dict concated with the requested piece
	// const dict = message.fastParse(payload)
	// const req = {msg_type: 1, piece: dict.piece}
	// let message = null
	// try {
	// 	message = bencode.encode(req)
	// } catch (e) {
	// 	console.log(e)
	// }
	// client.write(message.buildExtRequest(2, Buffer.concat([message, this.metaPieces[dict.piece]])))
}
Downloader.prototype.handleExtReject = function (client) {
	client.end()
}

Downloader.prototype.requestPiece = function (client, pieces, queue) {
	if (queue.choked) return null

	while (queue.length()) {
		const pieceBlock = queue.deque()
		if (pieces.needed(pieceBlock)) {
			client.write(message.buildRequest(pieceBlock))
			pieces.addRequested(pieceBlock)
			break
		}
	}
}

Downloader.prototype.chokeHandler = function (client) {
	console.log(client.remoteAddress, 'Choked')
	client.end()
}

Downloader.prototype.unchokeHandler = function (client, pieces, queue) {
	console.log(client.remoteAddress, 'Unchoked')
	queue.choked = false
	this.requestPiece(client, pieces, queue)
}

Downloader.prototype.haveHandler = function (client, pieces, queue, payload) {
	console.log(client.remoteAddress, 'Have')
	const pieceIndex = payload.readUInt32BE(0)
	const queueEmpty = queue.length === 0
	queue.queue(pieceIndex)
	if (queueEmpty) this.requestPiece(client, pieces, queue)
}
Downloader.prototype.bitfieldHandler = function (client, pieces, queue, payload) {
	console.log(client.remoteAddress, 'BF')
	const queueEmpty = queue.length === 0
	this.fileLength = payload.length * 8
	this.torrent.fileLength = this.fileLength
	payload.forEach((byte, i) => {
		for (let j = 0; j < 8; j += 1) {
			if (byte % 2) queue.queue(((i * 8) + 7) - j)
				byte = Math.floor(byte / 2)
		}
		if (queueEmpty) this.requestPiece(client, pieces, queue)
	})
}
Downloader.prototype.pieceHandler = function (client, pieces, queue, pieceResp) {
	console.log(client.remoteAddress, 'Piece')
	pieces.addReceived(pieceResp)
	const offset = (pieceResp.index * this.torrent.info['piece length']) + pieceResp.begin
	fs.write(this.file, pieceResp.block, 0, pieceResp.block.length, offset, () => {})

	if (pieces.isDone()) {
		console.log('DONE!')
		client.end()
		try { fs.closeSync(this.file) } catch (e) { console.log(e) }
	} else {
		this.requestPiece(client, pieces, queue)
	}
}


export default Downloader
