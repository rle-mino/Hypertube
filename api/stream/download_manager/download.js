/* eslint semi: ["error", "never"]*/
import net from 'net'
import fs from 'fs'
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
	peers.forEach(p => {
		this.download(p, this.torrent, this.pieces)
	})
}

Downloader.prototype.download = function (peer, torrent, pieces) {
	const client = new net.Socket()
	client.on('error', () => log.e('.'))
	client.connect(peer.port, peer.ip, () => {
		client.write(message.buildHandshake(torrent))
	})
	const queue = new Queue(torrent)
	this.onWholeMsg(client, msg => this.msgHandler(msg, client, pieces, queue))
}

Downloader.prototype.msgHandler = function (msg, client, pieces, queue) {
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
			default: break
		}
	}
}

Downloader.prototype.isHandshake = function (msg) {
	return msg.length === msg.readUInt8(0) + 49 &&
		msg.toString('utf8', 1) === 'BitTorrent protocol'
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
