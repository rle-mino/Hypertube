/**
 * Created by opichou on 11/21/16.
 */
 /* eslint semi: ["error", "never"]*/
import { EventEmitter } from 'events'
import inherits from 'inherits'
import Downloader from './download_manager/download'
import log from './lib/log'

function TorrentFile(torrent, rpc) {
    if (!(this instanceof TorrentFile)) return new TorrentFile(torrent, rpc)
	if (!rpc) throw new Error('Cannot initialize torrent without routing table')
	const self = this
	this.kadmelia = rpc
	this.queue = [] // this is a queue for torrent files
	this.feedbacks = 0

	if (torrent) self.addTorrent(torrent)
}

inherits(TorrentFile, EventEmitter)

TorrentFile.prototype.addTorrent = function (torrent) {
	const self = this
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
	this.kadmelia.on('get_peers', (p) => self.addPeer(p))
	this.kadmelia.on('error', () => {})
}

TorrentFile.prototype.addPeer = function (peers) {
	const self = this
	self.feedbacks += 1
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
