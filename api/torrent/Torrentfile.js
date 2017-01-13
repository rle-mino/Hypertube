/**
 * Created by opichou on 11/21/16.
 */
 /* eslint semi: ["error", "never"]*/
import { EventEmitter }			from 'events'
import inherits							from 'inherits'
import fs										from 'fs'
import path									from 'path'

import Downloader						from './download_manager/download'
import log									from './lib/log'

const DEBUG = false
const __preloadRatio = 5 / 100
const __superfast = false

function TorrentFile(torrent, rpc) {
    if (!(this instanceof TorrentFile)) return new TorrentFile(torrent, rpc)
	if (!rpc) throw new Error('Cannot initialize torrent without routing table')

	const self = this
	this.info = null
	this.files = null
	this._path = null
	this.file = null
	this._decay = 0
	this._ready = false
	this.kademlia = rpc
	this.queue = [] // this is a queue for torrent files
	this.feedbacks = 0

	this.kademlia.on('error', console.log)

	if (torrent) self.addTorrent(torrent)
}

inherits(TorrentFile, EventEmitter)

/*
* Torrent info are not available right away when using an infoHash alone to
* start downloading. As it will be provided by the swarm, it will be updated
* here.
*/

TorrentFile.prototype.setInfo = function (info) {
	if (info) {
		this.info = info
		this._name = this.info.name.toString('ascii')
		this._length = info['length'] || info.files.reduce((a, b) => a + b['length'], 0)
		log.i(`Downloading ${this._name}`)
		console.log()
		this.findMovie()
	}
}

/*
* In the eventuality the file we download is a folder, we need to identify the
* movie file from the torrent.info.files array.
*/

TorrentFile.prototype.findMovie = function () {
	if (!this.info.files) this._path = this.info.name.toString('ascii')
	else {
		this.files = this.info.files
		let file = 0
		for (let i = 1; i < this.files.length; i += 1) {
			if (this.files[i]['length'] > this.files[file]['length']) {
				file = i
			}
		}
		for (let i = 0; i < file; i += 1) {
			this._decay += this.files[i]['length']
		}
		this._path = this._name
			+ path.sep
			+ this.files[file].path.toString('ascii')
	}
}

/*
* The following functions are exposing a simplified FS library to the downloader
*/

TorrentFile.prototype.open = function () {
	if (__superfast) {
		this.file = Buffer.alloc(this._length)
	} else if (!this.files) {
		this.file = fs.openSync(`public${path.sep}${this._path}`, 'w')
	} else {
		const folderPath = `public${path.sep + this._name}`
		if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath)
		const addFd = (f) => {
			return {
				fd: fs.openSync(folderPath + path.sep + f.path.toString('ascii'), 'w'),
				path: f.path,
				length: f['length'],
			}
		}
		this.files = this.files.map(addFd)
	}
}

TorrentFile.prototype.read = function (block, length, begin) {
	if (__superfast) {
		this.file.slice(begin, begin + length)
	} else if (!this.files) {
		return fs.read(this.file, block, 0, length, begin, () => {})
	}
		const file = this.findFile(begin, begin + length)
		const read = new Array(file.length)
		file.forEach((f, i) => {
			read[i] = Buffer.alloc(f.len)
			fs.read(f.fd, read[i], 0, f.len, f.begin, () => {})
		})
		return Buffer.concat(read)
}

TorrentFile.prototype.write = function (block, length, offset) {
	if (DEBUG) console.log('length written:', length)
	if (__superfast) {
		block.copy(this.file, offset, 0, length)
	} else if (!this.files) {
		fs.write(this.file, block, 0, length, offset, () => {})
	} else {
		const file = this.findFiles(offset, offset + length)
		let len = 0
		file.forEach((f) => {
			const tmp = block.slice(len, len + f.len)
			len += f.len
			fs.write(f.fd, tmp, 0, f.len, f.begin, () => {})
		})
	}
}

TorrentFile.prototype.close = function () {
	if (!this.files) {
		try {
			fs.closeSync(this.file)
		} catch (e) {
			console.log(e)
		}
	} else {
		try {
			this.files.forEach(f => {
				fs.closeSync(f)
			})
		} catch (e) {
			console.log(e)
		}
	}
	if (!this._ready) this._ready = true
	this.emit('done', this._path)
}

TorrentFile.prototype.play = function () {
	if (!this._ready) {
		this.emit('ready', this._path)
		this._ready = true
	}
}

/*
* This function returns the list of file descriptors to be modified, given a
* start and end relative to the total torrent buffer
*/

TorrentFile.prototype.findFiles = function (begin, end) {
	const self = this
	if (!Array.isArray(this.files)) return null
	const ret = []
	let start = 0
	this.files.forEach((f, i) => {
		if (begin < start + f['length'] && end > start) {
			ret.push({
				fd: f.fd,
				begin: Math.max(0, begin - start),
				end: Math.min(f['length'], end - start),
				len: Math.min(f['length'], end - start)
					- Math.max(0, begin - start),
			})
		}
		start += f['length']
	})
	if (DEBUG) console.log('files:', this.files)
	if (DEBUG) console.log('impacted files: ', ret)
	return ret
}

/*
* Upon specifying a torrent (on creating -if using hash- or once torrent file
* fetched when using .torrent files), the addTorrent function initializes the
* search for peers within the distributed hash table (DHT)
*/

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

/*
* Triggered by the DHT, feeds the downloader with peers, expending the swarm up
* to the limit specified in the node component
*/

TorrentFile.prototype.addPeer = function (peers) {
	// this.kademlia.abortAll() // use to force close the UDP RCP
	const self = this
	self.feedbacks += 1
	if (!self.downloader) {
		try {
			self.downloader = new Downloader(self.torrent, peers, this)
			self.downloader.on('dlStatus', ratio => {
				if (ratio > __preloadRatio) this.play()
			})
		} catch (e) { console.log(e) }
		if (!self.downloader) throw new Error('Downloader was not created')
	} else {
		this.downloader.addPeers(peers)
	}
}

export default TorrentFile
