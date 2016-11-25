/**
 * Created by opichou on 11/21/16.
 */
import Piece from './piece'
import torrentParser from './torrent-parser'
import tracker from './tracker'
import chalk from 'chalk'

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))

module.exports = TorrentFile

function TorrentFile(torrent) {
    if (!(this instanceof TorrentFile)) return new TorrentFile(torrent)

    this.torrent = torrent

    this.Pieces = [] // this is a list of movie Pieces

    tracker.getPeers(torrent, peers => {
        peers.forEach(() => {ylog('|')})
    })

    // let piecesBuf = Buffer.from(this._pieces)
    // this.movie = Buffer.alloc(this.totalLength) // this is the actual file being downloaded by Pieces
    //
    // this.createPiece = (i, len) => {
    //     if (len = 0) return
    //     let pieceBuf = piecesBuf.slice(i * 20, (i + 1) * 20)
    //     let moviePiece = this.movie.slice(i * this.length, len)
    //     this.Pieces[i] = new Piece(this.length)
    //     this.Pieces[i].init(pieceBuf, moviePiece, this.tracker, i)
    // }
    // let i
    // for (i = 0; i < 3; i++) {
    //     this.createPiece(i, this.length)
    // }
    // this.createPiece(i, this.totalLength % this.length)
}

TorrentFile.prototype.init = function() {
    this.info()
}

TorrentFile.prototype.info = () => {
    this.movie.forEach(e => {
        if (!e) {elog('|')} else {ilog('|')}
    })
}
