/* eslint semi: ["error", "never"]*/
import net from 'net'
import tracker from '../tracker'
import message from './message'
import Piece from '../piece'
import torrentParser from '../torrent-parser'
import log from '../lib/log'

process.on('uncaughtException', function (err) {
    console.log(err)
})

function Downloader(torrent, peers, port) {
	if (!(this instanceof Downloader)) return new Downloader(torrent, peers, port)
	console.log('constructor', torrent)
	this.requested = []
	this.queue = []
	this.peers = []
	this._port = port
	this.torrent = torrent
	if (peers) this.addPeers(peers)
}

Downloader.prototype.addPeers = function (peers) {
	this.peers = [...this.peers, ...peers]
	peers.forEach(p => {
		this.download(p, this.torrent)
	})
}

Downloader.prototype.download = function (peer, torrent, requested) {
	console.log(torrent)
	this.client = new net.Socket()
	this.client.on('error', console.log)
	this.client.connect(peer.port, peer.ip, () => {
		this.client.write(message.buildHandshake(torrent))
	})
	this.onWholeMsg(this.client, msg => this.msgHandler(msg, this.client, requested))
}

Downloader.prototype.msgHandler = (msg, client, requested) => {
	console.log(msg)
	if (this.isHandshake(msg)) {
		client.write(message.buildInterested())
	} else {
		const m = message.parse(msg)

		switch (m.id) {
			case 0: this.chockHandler()
			break
			case 1: this.unchokeHandler()
			break
			case 4: this.haveHandler(m.payload, client, requested, this.queue)
			break
			case 5: this.bitfieldHandler(m.payload)
			break
			case 7: this.pieceHandler(m.payload, client, requested, this.queue)
			break
			default: break
		}
	}
}

Downloader.prototype.isHandshake = (msg) => {
	return msg.length === msg.readUInt8(0) + 49 &&
		msg.toString('utf8', 1) === 'BitTorrent protocol'
}

Downloader.prototype.onWholeMsg = (client, callback) => {
	let savedBuf = Buffer.alloc(0)
	let handshake = true

	client.on('data', resBuf => {
		const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readUInt32BE(0) + 4
		savedBuf = Buffer.concat([savedBuf, resBuf])

		while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
			callback(savedBuf.slice(0, msgLen()))
			savedBuf = savedBuf.slice(msgLen())
			handshake = false
		}
	})
}

Downloader.prototype.haveHandler = (payload, socket, requested, queue) => {
	const pieceIndex = payload.readUInt32BE(0)
	if (!requested[pieceIndex]) {
		socket.write(message.buildRequest())
	}
	requested[pieceIndex] = true
	queue.shift();
	requestPiece(client, requested, queue)
}

Downloader.prototype.requestPiece = function(socket, requested, queue) {
	if (requested[queue[0]]) {
		queue.shift()
		client.write(message.buildRequest(pieceIndex))
	}
}

export default Downloader
