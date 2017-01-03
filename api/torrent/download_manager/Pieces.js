/* eslint semi: ["error", "never"]*/

import Bitfield from 'bitfield'
import tp from './torrent-parser'

module.exports = class {
	constructor(torrent) {
		function buildPiecesArray() {
			const nPieces = torrent.info.pieces.length / 20 || 0
			const arr = new Array(nPieces).fill(null)
			return arr.map((_, i) => new Array(tp.blocksPerPiece(torrent, i)).fill(false))
		}
		this.received = buildPiecesArray()
		this.requested = buildPiecesArray()
		this._bitfield = new Bitfield(torrent.info.pieces.length / 20)
	}

	piecesBitfield() {
		return this._bitfield
	}

	addRequested(pieceBlock) {
		const blockIndex = pieceBlock.begin / tp.BLOCK_LEN
		this.requested[pieceBlock.index][blockIndex] = true
	}

	addReceived(pieceBlock) {
		this._bitfield.set(pieceBlock.index)
		const blockIndex = pieceBlock.begin / tp.BLOCK_LEN
		this.received[pieceBlock.index][blockIndex] = true
	}

	needed(pieceBlock) {
		if (this.requested.every(blocks => blocks.every(i => i))) {
			this.requested = this.received.map(blocks => blocks.slice())
		}
		const blockIndex = pieceBlock.begin / tp.BLOCK_LEN
		return !this.requested[pieceBlock.index][blockIndex]
	}

	isDone() {
		return this.received.every(blocks => blocks.every(i => i))
	}
}
