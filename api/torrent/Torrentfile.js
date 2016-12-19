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
	this.kademlia = rpc
	this.queue = [] // this is a queue for torrent files
	this.feedbacks = 0

	this.kademlia.on('error', console.log)

	if (torrent) self.addTorrent(torrent)
}

inherits(TorrentFile, EventEmitter)

TorrentFile.prototype.addTorrent = function (torrent) {
	const self = this
	if (this.kademlia.state !== 'ready') {
		this.queue = [torrent, ...this.queue]
		this.kademlia.once('ready', () => {
			this.torrent = this.queue[0]
			this.kademlia.buildAddressBook(this.torrent.infoHashBuffer)
		})
	} else {
		this.torrent = torrent
		this.kademlia.buildAddressBook(torrent.infoHashBuffer)
	}
	this.kademlia.on('get_peers', (p) => self.addPeer(p))
}

TorrentFile.prototype.addPeer = function (peers) {
	// this.kademlia.abortAll() // use to force close the udp rcp
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
