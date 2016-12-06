import chalk from 'chalk'
import net from 'net'
import tracker from './tracker'
import message from './message'
import Piece from './piece'
import torrentParser from './torrent-parser'

module.exports = downloader => {
	const requested = []
	tracker.getPeers(torrent, peers => {
		const pieces = new Piece(torrentParser.length(torrent))
		peers.forEach(peer => download(peer, torrent, requested))
	})
}

const download = (peer, torrent, requested) => {
	const client = new net.Socket()
	client.on('error', throw new Error('Error during communication with peer' +
	'see downloader object in stream/download_manager/download.js)'))
	client.connect(peer.port, peer.ip, () => {
		socket.write(message.buildHandshake(torrent))
	})

	const queue = []
	onWholeMsg(client, msg =>msgHandler(msg, client, requested))
}

const msgHandler = (msg, client, requested) => {
	if (isHandshake(msg)) {
		client.write(message.buildInterested())
	} else {
		const m = message.parse(msg)

		switch (m.id){
			case 0: chockHandler() break
			case 1: unchokeHandler() break
			case 4: haveHandler(m.payload, client, requested, queue) break
			case 5: bitfieldHandler(m.payload) break
			case 7: pieceHandler(m.payload, client, requested, queue) break
		}
	}
}

const isHandshake = (msg) => {
	return msg.length === msg.readUInt8(0) + 49 &&
		msg.tostring('utf8', 1) === 'BitTorrent protocol'
}

const onWholeMsg = (client, callback) => {
	let savedBuf = Buffer.alloc(0)
	let handshake = true

	client.on('data', resBuffer => {
		const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readUInt32BE(0) + 4
		savedBuf = Buffer.concat([savedBuf, resBuf])

		while(savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
			callback(savedBuf.slice(0, msgLen()))
			savedBuf = savedBuf.slice(msgLen())
			handshake = false
		}
	})

})

const haveHandler = (payload, socket, requested, queue) => {
	const pieceIndex = payload.readUInt32BE(0)
	if (!requested[pieceIndex]) {
		socket.write(message.buildRequest())
	}
	requested[pieceIndex] = true
	queue.shift();
	requestPiece(client, requested, queue)
}

const requestPiece(socket, requested, queue) {
	if (requested[queue[0]]) {
		queue.shift()
		client.write(message.buildRequest(pieceIndex))
	}
}
