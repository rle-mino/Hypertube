/* eslint semi: ["error", "never"]*/
import net from 'net'
import fs from 'fs'
import bencode from 'bencode'
import message from './message'
import log from '../lib/log'
import Pieces from './Pieces'
import Queue from './Queue'

process.on('uncaughtException', () => log.e('.'))

function Downloader(torrent, peers) {
	if (!(this instanceof Downloader)) return new Downloader(torrent, peers, port)
	this.requested = []
	this.received = []
	this.peers = []
	this.torrent = torrent
	this.size = torrent.xl || torrent.size || torrent.info.pieces.length / 20 || 0
	this.pieces = new Pieces(torrent)
	this.file = fs.open(torrent.name, 'w')
	if (peers) this.addPeers(peers)
}

Downloader.prototype.addPeers = function (peers) {
	if (this.torrent.magnet && !this.torrent.info) {
		this.peers = [...this.peers, peers]
		const peer = this.peers.shift()
		this.download(peer, this.torrent, this.pieces, true)
		this.peers.push(peer)
	} else {
		peers.forEach(p => {
			this.download(p, this.torrent, this.pieces)
		})
	}
}

Downloader.prototype.download = function (peer, torrent, pieces, ext) {
	const client = new net.Socket()
	client.on('error', () => log.e('.'))
	client.connect(peer.port, peer.ip, () => {
		client.write(message.buildHandshake(torrent, (torrent.magnet && !torrent.info)))
	})
	const queue = new Queue(torrent)
	this.onWholeMsg(client, msg => this.msgHandler(msg, client, pieces, queue))
}

Downloader.prototype.msgHandler = function (msg, client, pieces, queue) {
	if (this.torrent.magnet && !!this.torrent.info && this.isExtended(msg)) {
		this.extendedHandler(client, pieces, queue, msg)
	}
	if (this.isHandshake(msg)) {
		client.write(message.buildInterested())
	} else {
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
			case 20: this.extendedHandler(client, pieces, queue, m.payload)
			break
			default: break
		}
	}
}

Downloader.prototype.isHandshake = function (msg) {
	return msg.length === msg.readUInt8(0) + 49 &&
		msg.toString('utf8', 1) === 'BitTorrent protocol'
}

Downloader.prototype.isExtended = function (msg) {
	const header = message.fastParse(msg)
	return (Boolean(header.reservedByte[5] & 0x10))
}

Downloader.prototype.extendedHandler = function (client, pieces, queue, msg) {
	const extMessage = message.fastParse(msg)
	if (extMessage.extId === 0) this.extHandshake(client, extMessage)
	else this.extMetaData(extMessage)
}

Downloader.prototype.extHandshake = function (client, msg) {
	console.log(msg)
	const dict = bencode.decode(msg.payload)
	if (dict.m.ut_metadata) {
		if (!this.metaInfo) {
			this.metaInfo = new Array(Math.ceil(dict.metadata_size / 16384))
			this.metaInfo.fill(0)
		}
		this.metaInfoSize = dict.metadata_size
		for (let i = 0; i < this.metInfo.length; i += 1) {
			client.write(message.buildExtRequest(this.torrent, i, dict.m.ut_metadata))
		}
	}
}
Downloader.prototype.extMetaData = function (msg) {
	const dict = bencode.decode(msg.payload)
	const piece = msg.payload.slice(msg.payload.length - dict.total_size, dict.total_size)
	this.metaInfo[dict.piece] = piece
	if (this.metaInfo.every(e => e > 0)) {
		const info = Buffer.concat(this.metaInfo, this.metaInfoSize)
		if (message.verify(this.torrent, info)) { // DOIT CREER LA FONCTION QUI VERIFIE LE INFO GRACE AU HASH
			this.torrent.info = message.torrentInfoParser(info) // DOIT CREER LA FONCTION QUI PARSE LE FICHIER TELECHARGE
			this.doDownload() // DOIT CREER LA FONCTION QUI DEQUE LORSQUE L INFOHASH EST RECUPERE
		}
	}
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
