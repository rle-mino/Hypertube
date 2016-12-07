/**
 * Created by opichou on 11/21/16.
 */
 /* eslint semi: ["error", "never"]*/
import { EventEmitter } from 'events'
import inherits from 'inherits'
import Piece from './piece'
import torrentParser from './torrent-parser'
import tracker from './tracker'
import anon from './anonymizer'
import RPC from './KRPC/rpc'
import Downloader from './download_manager/download'
import log from './lib/log'

function TorrentFile(torrent, rpc) {
    if (!(this instanceof TorrentFile)) return new TorrentFile(torrent, rpc)
	if (!rpc) throw new Error('Cannot initialize torrent without routing table')
	const self = this
	this.kadmelia = rpc
    this.Pieces = [] // this is a list of movie Pieces
	this.queue = [] // this is a queue for torrent files

	if (torrent) self.addTorrent(torrent)
}

inherits(TorrentFile, EventEmitter)

TorrentFile.prototype.addTorrent = function (torrent) {
	if (this.kadmelia.state !== 'ready') {
		this.queue = [torrent, ...this.queue]
		this.kadmelia.once('ready', () => {
			this.torrent = this.queue[0]
			this.kadmelia.buildAddressBook(this.torrent.infoHashBuffer)
		})
	} else {
		this.torrent = torrent
		this.kadmelia.buildAddressBook(torrent.infoHashBuffer)
	}
	this.kadmelia.on('get_peers', this.addPeer)
}

TorrentFile.prototype.addPeer = function (peers, token) {
	const self = this
	// log.r('|o|')
	console.log(this.torrent.infoHash)
	if (!self.downloader) {
		self.downloader = new Downloader(self.torrent, peers)
	}
	this.downloader.addPeers(peers)
}

TorrentFile.prototype.init = () => {
    this.info()
}

TorrentFile.prototype.info = () => {
    this.movie.forEach(e => {
        if (!e) { log.e('|') } else { log.i('|') }
    })
}

export default TorrentFile
