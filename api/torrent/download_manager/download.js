/* eslint semi: ["error", "never"]*/
import net from 'net'
import bencode from 'bencode'
import uniq from 'uniq'
import { inherits } from 'util'
import EventEmitter from 'events'
import tp from './torrent-parser'
import message from './message'
import log from '../lib/log'
import Pieces from './Pieces'
import Queue from './Queue'
// import utMetadataExt from './extension/ut_metadata'

const MAX_ACCEPTED_SIZE = 10000000
const MAX_CONNEXIONS_LIMIT = 2000
const DEBUG = false

function Downloader(torrent, peers, file) {
	if (!(this instanceof Downloader)) return new Downloader(torrent, peers, file)
	const self = this
	this.torrent = torrent
	this.file = file
	this.metaId = 2
	this.metaDataSize = 0
	this._connexions = 0
	this._handshakes = []
	this.peers = []
	this.state = 'building'
	if (torrent && torrent.info && torrent.info.pieces) {
		self.size = torrent.info.pieces.length / 20
		self.pieces = new Pieces(torrent)
	} else {
		this.state = 'fetching metadata'
		log.i('fetching metadata')
		self.size = 0
	}
	if (peers) this.addPeers(peers)
}

inherits(Downloader, EventEmitter)

Downloader.prototype.addPeers = function (peers) {
	this.peers = [...peers, ...this.peers]
	uniq(this.peers)
	if (this.state !== 'downloading' && this.state !== 'saturated') {
		this.startDownloading()
	}
}

Downloader.prototype.showTorrent = function (pieces) {
	let rec = 0
	let missing = 0
	pieces.received.forEach(p => {
		p.forEach(b => {
			if (b) rec += 1
			else missing += 1
		})
	})
	if (missing === 0) log.i('download complete')
	else log.i(`downloaded: ${Math.floor((rec / (rec + missing)) * 10000) / 100}%`)
	this.emit('dlStatus', rec / (rec + missing))
}

Downloader.prototype.startDownloading = function () {
	this.state = 'downloading'
	this.callInterval = setInterval(() => {
		if (this._connexions > MAX_CONNEXIONS_LIMIT) {
			this.state = 'saturated'
		} else if (this.peers.length > 0) {
			this._connexions += 1
			const peer = this.peers.pop()
			this.download(peer, this.torrent, this.pieces, this.torrent && !this.torrent.info)
		}
		if (this.pieces) this.showTorrent(this.pieces)
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
			this.sendBitfield(client, pieces)
			client.write(message.buildInterested())
		}
	} else if (this.torrent.info) {
		const m = message.parse(msg)
		switch (m.id) {
			case 0: this.chokeHandler(client)
			break
			case 1: this.unchokeHandler(client, pieces, queue)
			break
			case 2: client.write(message.buildUnchoke())
			break
			case 4: this.haveHandler(client, pieces, queue, m.payload)
			break
			case 5: this.bitfieldHandler(client, pieces, queue, m.payload)
			break
			case 7: this.pieceHandler(client, pieces, queue, m.payload)
			break
			case 9: this.handlePieceRequest(client, m.payload)
			break
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
	if (DEBUG) console.log(client.remoteAddress, 'Piece request')
	const { index, begin, length }	= msg
	const pLen						= index > 0
		? (index - 1) * this.torrent.info['piece length']
		: 0
	const block						= Buffer.alloc(length)

	if (!this.pieces.received[index][Math.floor(begin / tp.BLOCK_LEN)]) return
	this.file.read(block, length, pLen + begin)
	client.write(message.buildPiece({ index, begin, block }))
}

Downloader.prototype.sendBitfield = function (client, pieces) {
	const bitfield = pieces.piecesBitfield()
	if (bitfield) client.write(message.buildBitfield(bitfield))
}

Downloader.prototype.keepAlive = client => {
	const sendKA = () => client.write(message.buildKeepAlive())
	setInterval(sendKA, 119999)
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

Downloader.prototype.onMetadata = function (info) {
	if (DEBUG) console.log('info:', info)
	this.torrent.info = info
	this.file.setInfo(info)
	this.size = info.pieces.length / 20
	this.pieces = new Pieces(this.torrent)
	this.file.open('tmp')
	this.doDownload()
}

Downloader.prototype.handleExtPiece = function (payload, trailer) {
	const piece = trailer
	this.metaPieces[payload.piece] = piece
	if (!this.torrent.info && this.metaPieces.every(e => e !== 0)) {
		let info = Buffer.concat(this.metaPieces)
		try {
			const buf = bencode.decode(info).info
			if (buf) {
				info = buf
			} else {
				info = bencode.decode(info)
			}
			if (message.verify(this.torrent, bencode.encode(info))) {
				this.onMetadata(info)
			} else {
				console.log('hash error')
			}
		} catch (e) {
			console.log(e)
		}
	}
}

Downloader.prototype.handleExtQuery = function (client, payload) {
	if (DEBUG) console.log('unhandled metadata request')
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
	} // this.requestAllMissing(client, pieces, queue)
}

Downloader.prototype.requestAllMissing = function (client, pieces, queue) {
	pieces.received.forEach((p, i) => {
		if (!p.every(b => b)) queue.queue(i)
	})
	while (queue.length()) {
		const pieceBlock = queue.deque()
		client.write(message.buildRequest(pieceBlock))
	}
}

Downloader.prototype.chokeHandler = function (client) {
	if (DEBUG) console.log(client.remoteAddress, 'Choked')
	client.end()
}

Downloader.prototype.unchokeHandler = function (client, pieces, queue) {
	if (DEBUG) console.log(client.remoteAddress, 'Unchoked')
	queue.choked = false
	this.requestPiece(client, pieces, queue)
}

Downloader.prototype.haveHandler = function (client, pieces, queue, payload) {
	if (DEBUG) console.log(client.remoteAddress, 'Have')
	const pieceIndex = payload.readUInt32BE(0)
	const queueEmpty = queue.length === 0
	queue.queue(pieceIndex)
	if (queueEmpty) this.requestPiece(client, pieces, queue)
}

Downloader.prototype.bitfieldHandler = function (client, pieces, queue, payload) {
	if (DEBUG) console.log(client.remoteAddress, 'BF')
	const queueEmpty = queue.length === 0
	const testByte = (byte, i, j) => {
		if (byte) {
			testByte(Math.floor(byte / 2), i, j + 1)
			if (byte % 2) queue.queue(((i * 8) + 7) - j)
		}
	}
	payload.forEach((byte, i) => {
		testByte(byte, i, 0)
		if (queueEmpty) this.requestPiece(client, pieces, queue)
	})
}

Downloader.prototype.pieceHandler = function (client, pieces, queue, pieceResp) {
	if (DEBUG) console.log(client.remoteAddress, 'Piece')
	pieces.addReceived(pieceResp)
	const offset = (pieceResp.index * this.torrent.info['piece length']) + pieceResp.begin
	this.file.write(pieceResp.block, pieceResp.block.length, offset)

	if (pieces.isDone()) {
		console.log('DONE!')
		client.end()
		this.file.close()
	} else {
		this.requestPiece(client, pieces, queue)
	}
}


export default Downloader
