/**
 * Created by opichou on 11/21/16.
 */
 /* eslint semi: ["error", "never"]*/
import chalk from 'chalk'
import { EventEmmitter } from 'events'
import Piece from './piece'
import torrentParser from './torrent-parser'
import tracker from './tracker'
import anon from './anonymizer'
import RPC from './KRPC/rpc'
import Downloader from './download_manager/download'

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))

function TorrentFile(torrent) {
    if (!(this instanceof TorrentFile)) return new TorrentFile(torrent)

    this.Pieces = [] // this is a list of movie Pieces
	const self = this
	this.queue = [] // this is a queue for torrent files

	if (torrent) {
		self.addTorrent(torrent.infoHashBuffer)
	}

    tracker.getPeers(torrent, peers => {
		try {
			self.kadmelia = new RPC({ peers })
			self.kadmelia.once('ready', () => {
				self.kadmelia.buildAddressBook(self.queue.shift())
			})
			self.kadmelia.on('get_peers', self.addPeer)

		    // let piecesBuf = Buffer.from(this._pieces)
		    // this.movie = Buffer.alloc(this.totalLength) // this is the actual file
			// being downloaded by Pieces
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

		} catch (e) {
			console.log(e)
		}
	})
}

TorrentFile.prototype.addTorrent = function (infoHash) {
	if (this.kadmelia && this.kadmelia.state && this.kadmelia.state === 'ready') {
			this.kadmelia.buildAddressBook(infoHash)
	} else {
		this.queue.push(infoHash)
	}
}

TorrentFile.prototype.addPeer = (peer, token) => {
	console.log(token)
	peer.forEach(p => {
		console.log(p)
	})
}

TorrentFile.prototype.init = function() {
    this.info()
}

TorrentFile.prototype.info = () => {
    this.movie.forEach(e => {
        if (!e) { elog('|') } else { ilog('|') }
    })
}
module.exports = TorrentFile
