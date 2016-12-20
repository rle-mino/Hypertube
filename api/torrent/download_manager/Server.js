/* eslint semi: ["error", "never"]*/

import net from 'net'
import bencode from 'bencode'
import log from '../lib/log'
import message from './message'

function Server(client) {
	if (!(this instanceof Server)) return new Server(client)
	const self = this
	this.port = client.TCPPort
	this.ip = client.IP
	this.server = net.createServer()
	this.server.listen(this.port, this.ip)
	this.server.on('error', self.onError)
	this.server.on('connection', self.onConnection)
	this.server.on('listening', () => console.log('Torrent client listening on', self.server.address()))
}

Server.prototype.onError = function (e) {
	const self = this
	if (e.code === 'EADDRINUSE') {
		log.i('Address in use, retrying...')
		setTimeout(() => {
			self.server.close()
			self.port = self.port >= 65000 ? 6881 : self.port + 1
			self.server.listen(self.port, self.ip)
		}, 1000)
	}
}

Server.prototype.onConnection = function (socket) {
	socket.on('data', console.log)
	this.onWholeMsg(socket, msg => this.msgHandler(msg))
}

Server.prototype.getPort = function () {
	return this.server.address().port
}

Server.prototype.msgHandler = function (msg, client, pieces, queue) {
	console.log(msg)
	if (msg.length > 5) {
		try {
			const pl = bencode.decode(msg.slice(6))
			if (pl.msg_type) { console.log(pl.msg_type) }
		} catch (e) {
			e => {}
		}
	}
	if (this.isExtended(msg)
		&& this.isHandshake(msg)) {
		const handshake = bencode.encode({ m: { ut_metadata: this.metaId } })
		client.write(message.buildExtRequest(0, handshake))
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

Server.prototype.isHandshake = function (msg) {
	return (msg.length === msg.readUInt8(0) + 49 &&
		msg.toString('utf8', 1, 20) === 'BitTorrent protocol')
}

Server.prototype.isExtended = function (msg) {
	const size = msg.readUInt8(0)
	return msg.slice(size + 1, size + 9)[5] === 16
}

Server.prototype.extendedHandler = function (client, pieces, queue, msg) {
	if (msg.toString('utf8', 1, 20) === 'BitTorrent protocol') return
	const extMessage = message.fastParse(msg)
	const str = extMessage.payload.toString()
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
		console.log('server extended')
		const utMetadata = payload.m && payload.m.ut_metadata
		const metadataSize = payload.metadata_size
		this.metaDataSize = metadataSize
		if (metadataSize && metadataSize > 0 && metadataSize < MAX_ACCEPTED_SIZE) {
			if (!this.metaPieces && metadataSize && metadataSize > 0) {
				this.metaPieces = new Array(Math.ceil(metadataSize / 16384))
				this.metaPieces.fill(0)
			}
			// const handshake = bencode.encode({ m: { ut_metadata: this.metaId } })
			// client.write(message.buildExtRequest(this.torrent, 0, handshake))
			const req = bencode.encode({ msg_type: 0, piece: this.metaPieces.indexOf(0) })
			client.write(message.buildExtRequest(utMetadata, req))
		}
	} else {
		console.log('not handshake', extMessage.extId)
		switch (msgType) {
			case 1: {
				log.l('msg_type: ', msgType)
			} break
			case 0: console.log('requestXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
			break
			case 2: console.log('rejected requestXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
			break
			default: console.log('spammedXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
			break
		}
	}
}

Server.prototype.onWholeMsg = (client, callback) => {
	let savedBuf = Buffer.alloc(0)
	let handshake = true

	client.on('data', resBuf => {
		const msgLen = () => { return handshake ?
			savedBuf.readUInt8(0) +
			49 :
			savedBuf.readUInt32BE(0) + 5 }
		savedBuf = Buffer.concat([savedBuf, resBuf])

		while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
			callback(savedBuf.slice(0, msgLen()))
			savedBuf = savedBuf.slice(msgLen())
			handshake = false
		}
	})
}

export default Server
