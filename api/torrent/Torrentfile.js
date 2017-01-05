/**
 * Created by opichou on 11/21/16.
 */
 /* eslint semi: ["error", "never"]*/
import { EventEmitter } from 'events'
import inherits from 'inherits'
import fs from 'fs'
import path from 'path'
import Downloader from './download_manager/download'
import log from './lib/log'

function TorrentFile(torrent, rpc) {
    if (!(this instanceof TorrentFile)) return new TorrentFile(torrent, rpc)
	if (!rpc) throw new Error('Cannot initialize torrent without routing table')
	const self = this
	this.info = null
	this.files = null
	this._path = null
	this.file = null
	this._ready = false
	this.kademlia = rpc
	this.queue = [] // this is a queue for torrent files
	this.feedbacks = 0

	this.kademlia.on('error', console.log)

	if (torrent) self.addTorrent(torrent)
}

inherits(TorrentFile, EventEmitter)

TorrentFile.prototype.setInfo = function (info) {
	if (info) {
		this.info = info
		this.files = info.files
		if (this.files) this._path = this.findMovie(this.files)
		else this._path = this.info.name.toString('ascii')
	}
}

TorrentFile.prototype.findMovie = function (files) {
	if (!this.files) return
	files.forEach(f => {
		console.log(f)
	})
}

TorrentFile.prototype.create = () => {
	if (!this.files) return
}

TorrentFile.prototype.open = function () {
	this.file = fs.openSync(`MovieLibrary${path.sep}${this._path}`, 'w')
}

TorrentFile.prototype.read = function (block, length, begin) {
	return fs.read(this.file, block, 0, length, begin, () => {})
}

TorrentFile.prototype.write = function (block, length, offset) {
	fs.write(this.file, block, 0, length, offset, () => {})
}

TorrentFile.prototype.close = function close() {
	try {
		fs.closeSync(this.file)
	} catch (e) {
		console.log(e)
	}
	if (!this._ready) this._ready = true
	this.emit('done', this._path)
}

TorrentFile.prototype.play = function () {
	this.emit('ready', this._path)
	this._ready = true
}

TorrentFile.prototype.addTorrent = function (torrent) {
	const self = this
	if (this.kademlia.state !== 'ready') {
		this.queue = [torrent, ...this.queue]
		this.kademlia.once('ready', () => {
			this.torrent = this.queue[0]
			this.setInfo(this.torrent.info)
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
		try {
			self.downloader = new Downloader(self.torrent, peers, this)
		} catch (e) { console.log(e) }
		if (!self.downloader) throw new Error('Downloader was not created')
	} else {
		this.downloader.addPeers(peers)
	}
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
