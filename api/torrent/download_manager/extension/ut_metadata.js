import bencode from 'bencode'
import message from '../message'

class utMetadataExt extends EventEmitter {
	constructor (wire) {
		this._wire = wire
	}

	msgHandler = (client, pieces, queue, msg) => {
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

	handleExtHandshake = function (client, pieces, queue, payload) {
		const utMetadata = payload.m && payload.m.ut_metadata
		const metadataSize = payload.metadata_size
		// this.metaDataSize = metadataSize
		if (utMetadata && metadataSize && metadataSize > 0
			&& metadataSize < MAX_ACCEPTED_SIZE) {
			if (!this._pieces) {
				this._pieces = new Array(Math.ceil(metadataSize / 16384))
				this._pieces.fill(0)
			}
			for (let i = 0; i < this._pieces.length; i += 1) {
				if (this._pieces[i] === 0) {
					const req = bencode.encode({ msg_type: 0, piece: i })
					client.write(message.buildExtRequest(utMetadata, req))
				}
			}
		}
	}

	handleExtPiece = function (payload, trailer) {
		const piece = trailer
		this._pieces[payload.piece] = piece
		if (this._pieces.every(e => e !== 0)) {
			let info = null
			try {
				const buf = Buffer.concat(this._pieces)
				info = bencode.decode(buf)
				if (message.verify(this.wire.torrent, bencode.encode(info))) {
					this.wire.torrent.info = info
					console.log('metadata fetched, downloading...')
					this.wire.doDownload()
				} else {
					console.log('hash error')
				}
			} catch (e) {
				console.log(e)
			}
		}
	}

	handleExtQuery = function (client, payload) {
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
		// client.write(message.buildExtRequest(2, Buffer.concat([message, this._pieces[dict.piece]])))
	}

	handleExtReject = function (client) {
		client.destroy()
	}

}

export default class utMetadataExt
