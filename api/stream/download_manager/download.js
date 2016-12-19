/* eslint semi: ["error", "never"]*/
import net from 'net'
import fs from 'fs'
import bencode from 'bencode'
import uniq from 'uniq'
import message from './message'
import log from '../lib/log'
import Pieces from './Pieces'
import Queue from './Queue'

// process.on('uncaughtException', () => log.e('.'))

function Downloader(torrent, peers) {
	if (!(this instanceof Downloader)) return new Downloader(torrent, peers)
	const self = this
	this.metaId = 2
	this.requested = []
	this.received = []
	this.peers = []
	this.handshakes = []
	this.torrent = torrent
	this.metaDataSize = 0
	if (torrent && torrent.info && torrent.info.pieces) {
		self.size = torrent.info.pieces.length / 20
		this.pieces = new Pieces(torrent)
	} else {
		self.size = 0
	}
	this.file = fs.openSync(torrent.name, 'w')
	if (peers) this.addPeers(peers)
}

Downloader.prototype.addPeers = function (peers) {
	log.l('+')
	if (this.torrent.magnet && !this.torrent.info) {
		log.l('X')
		this.peers = [...this.peers, ...peers]
		uniq(this.peers)
		uniq(peers)
		peers.forEach(p => {
			setTimeout(() => this.download(p, this.torrent, this.pieces, true), 500)
		})
	} else {
		this.peers.forEach(p => {
			this.download(p, this.torrent, this.pieces)
		})
		peers.forEach(p => {
			this.download(p, this.torrent, this.pieces)
		})
	}
}

Downloader.prototype.download = function (peer, torrent, pieces, ext) {
	const client = new net.Socket()
	client.on('error', () => {})
	client.connect(peer.port, peer.ip, () => {
		client.write(message.buildHandshake(torrent, ext))
	})
	const queue = new Queue(torrent)
	this.onWholeMsg(client, msg => this.msgHandler(msg, client, pieces, queue))
}

Downloader.prototype.msgHandler = function (msg, client, pieces, queue) {
	if (this.torrent.magnet
		&& !this.torrent.info
		&& this.isExtended(msg)
		&& this.isHandshake(msg)) {
		const handshake = bencode.encode({ m: { ut_metadata: this.metaId }, metadata_size: this.metaDataSize })
		client.write(message.buildExtRequest(this.torrent, 0, handshake))
	} else if (this.torrent.magnet
		&& !this.torrent.info
		&& msg.length > 4
		&& msg.readUInt8(4) === 20) {
		this.extendedHandler(client, pieces, queue, msg)
	} else if (this.torrent.info && this.isHandshake(msg)) {
		client.write(message.buildInterested())
	} else if (this.torrent.info) {
		const m = message.parse(msg)
		switch (m.id) {
			case 0: this.chockHandler(client)
			break
			case 1: this.unchokeHandler(client, pieces, queue)
			break
			case 4: this.haveHandler(client, pieces, queue, m.payload)
			break
			case 5: this.bitfieldHandler(client, pieces, queue, m.payload)
			break
			case 7: this.pieceHandler(client, pieces, queue, m.payload)
			break
			default: break
		}
	} else {
		this.handshakes.push({ msg, client, pieces, queue })
	}
}

Downloader.prototype.isHandshake = function (msg) {
	return (msg.length === msg.readUInt8(0) + 49 &&
		msg.toString('utf8', 1, 20) === 'BitTorrent protocol')
}

Downloader.prototype.isExtended = function (msg) {
	const size = msg.readUInt8(0)
	return msg.slice(size + 1, size + 9)[5] === 16
}

Downloader.prototype.extendedHandler = function (client, pieces, queue, msg) {
	if (msg.toString('utf8', 1, 20) === 'BitTorrent protocol') return
	const extMessage = message.fastParse(msg)
	let payload = msg.extId === 0
	try {
		payload = bencode.decode(extMessage.payload.toString('ascii'))
	} catch (e) {
		console.log(e)
	}
	const msgType = payload.msg_type || 'x'
	if (payload) {
		switch (msgType) {
			case 'x': {
				const utMetadata = payload.m && payload.m.ut_metadata
				const metadataSize = payload.metadata_size
				this.metaDataSize = metadataSize
				if (!this.metaPieces && metadataSize > 0) {
					this.metaPieces = new Array(Math.ceil(metadataSize / 16384))
					this.metaPieces.fill(0)
				}
				const req = bencode.encode({ msg_type: 0, piece: this.metaPieces.indexOf(0) })
				client.write(message.buildExtRequest(this.torrent, utMetadata, req))
				} break
			case 1: {
				console.log('msg_type: ', msgType)
				const piece = extMessage.payload.slice(msg.payload.length - payload.total_size, msg.payload.length)
				this.metaPieces[payload.piece] = piece
				if (this.metaInfo.every(e => e !== 0)) {
					const info = Buffer.concat(this.metaInfo, this.metaInfoSize)
					if (message.verify(this.torrent, info)) { // DOIT CREER LA FONCTION QUI VERIFIE LE INFO GRACE AU HASH
						this.torrent.info = message.torrentInfoParser(info) // DOIT CREER LA FONCTION QUI PARSE LE FICHIER TELECHARGE
						this.doDownload()
					}
				}
			}break
			case 0: console.log('requestXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
			break
			case 2: console.log('rejected requestXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
			break
			default: console.log('spammedXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
			break
		}
	}
}

// Downloader.prototype.extHandshake = function (client, dict) {
// 	if (dict.m.ut_metadata) {
// 		if (!this.metaInfo) {
// 			this.metaInfo = new Array(Math.ceil(dict.metadata_size / 16384))
// 			this.metaInfo.fill(0)
// 		}
// 		this.metaInfoSize = dict.metadata_size
// 		for (let i = 0; i < this.metInfo.length; i += 1) {
// 			client.write(message.buildExtRequest(this.torrent, i, dict.m.ut_metadata))
// 		}
// 	}
// }
Downloader.prototype.extMetaData = function (msg) {
	const dict = bencode.decode(msg.payload)
	const piece = msg.payload.slice(msg.payload.length - dict.total_size, dict.total_size)
	this.metaInfo[dict.piece] = piece
	if (this.metaInfo.every(e => e > 0)) {
		const info = Buffer.concat(this.metaInfo, this.metaInfoSize)
		if (message.verify(this.torrent, info)) { // DOIT CREER LA FONCTION QUI VERIFIE LE INFO GRACE AU HASH
			this.torrent.info = message.torrentInfoParser(info) // DOIT CREER LA FONCTION QUI PARSE LE FICHIER TELECHARGE
			this.doDownload()
		}
	}
}

Downloader.prototype.doDownload = function () {
	this.handshakes.forEach(h => {
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
		savedBuf = Buffer.concat([savedBuf, resBuf])

		while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
			callback(savedBuf.slice(0, msgLen()))
			savedBuf = savedBuf.slice(msgLen())
			handshake = false
		}
	})
}

Downloader.prototype.haveHandler = (payload, client, queue) => {
	const pieceIndex = payload.readUInt32BE(0)
	queue.push(pieceIndex)
	if (queue.length === 1) {
		this.requestPiece(client, queue)
	}
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

Downloader.prototype.pieceHandler = function (payload, client, queue) {
	log.r('||X||')
	queue.shift()
	this.requestPiece(client, queue)
}

Downloader.prototype.chokeHandler = function (client) {
	client.end()
}

Downloader.prototype.unchokeHandler = function (client, pieces, queue) {
	queue.chocked = false
	this.requestPiece(client, pieces, queue)
}

Downloader.prototype.haveHandler = function (client, pieces, queue, payload) {
	const pieceIndex = payload.readUInt32BE(0)
	const queueEmpty = queue.length === 0
	queue.queue(pieceIndex)
	if (queueEmpty) this.requestPiece(client, pieces, queue)
}
Downloader.prototype.bitfieldHandler = function (client, pieces, queue, payload) {
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
	console.log(pieceResp)
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
