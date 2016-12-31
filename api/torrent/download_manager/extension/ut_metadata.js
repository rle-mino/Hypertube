
class utMetadataExt extends EventEmitter {
	constructor (wire, pieces) {
		this._wire = wire
		this._pieces = pieces
	}

	msgHandler = (client, pieces, queue, msg) => {
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
			client.write(message.buildExtRequest(this.torrent, utMetadata, req))
		}
	} else {
		console.log('not handshake', extMessage.extId)
		switch (msgType) {
			case 1: {
				log.l('msg_type: ', msgType)
				const piece = trailer
				this.metaPieces[payload.piece] = piece
				if (this.metaInfo.every(e => e !== 0)) {
					const info = Buffer.concat(this.metaInfo, this.metaInfoSize)
					if (message.verify(this.torrent, info)) { // DOIT CREER LA FONCTION QUI VERIFIE LE INFO GRACE AU HASH
						this.torrent.info = message.torrentInfoParser(info) // DOIT CREER LA FONCTION QUI PARSE LE FICHIER TELECHARGE
						this.doDownload()
					}
				}
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

export default class utMetadataExt
