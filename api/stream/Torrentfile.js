/**
 * Created by opichou on 11/21/16.
 */
import Piece from './piece'

module.exports = TorrentFile

function TorrentFile(trackers, pieces, length, totalLength, files) {
    if (!(this instanceof TorrentFile)) return new TorrentFile(trackers, pieces, length, totalLength, files)

    this.trackers = trackers
    this._pieces = pieces
    this.length = length
    this.totalLength = totalLength
    this.files = files || []

    this.Pieces = []

    let piecesBuf  = Buffer.from(pieces)
    for (let i = 0; i * this.length < totalLength; i++) {
        let pieceBuf = Buffer.from('')
        pieceBuf = piecesBuf.slice(i * 20, (i + 1) * 20)
        this.Pieces[i] = new Piece(this.length)
        this.Pieces[i].init(pieceBuf, trackers, i)
    }

    console.log(this.pieces)
}

TorrentFile.prototype.init = function() {

    console.log(this.pieces)
}