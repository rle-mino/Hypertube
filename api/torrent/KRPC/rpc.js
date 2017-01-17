/* eslint semi: ["error", "never"]*/
import { inherits } from 'util'
import { EventEmitter } from 'events'
import bencode from 'bencode'
import dgram from 'dgram'
import Contact from './contact'
import Nodes from './node'
import * as queries from './queries'
import anon from '../lib/anonymizer'
import log from '../lib/log'
import tracker from '../tracker/tracker'

const torrentAmorce = {
	size: 1825361101,
	infoHash: '1581F09B4A26C3615F72B3B932627F5B8D6DD9F0'.toLowerCase(),
	infoHashBuffer: Buffer.from('1581F09B4A26C3615F72B3B932627F5B8D6DD9F0', 'hex'),
	announce: [
	'udp://p4p.arenabg.ch:1337',
	'udp://tracker.leechers-paradise.org:6969',
	'udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80',
	'udp://torrent.gresille.org:80/announce',
	'udp://tracker.opentrackr.org:1337/announce',
],
}

const MAX_ROUTING_TABLE = 21000
const MAX_NODES_LIMIT = 21000
const MAX_PEERS_LIMIT = 5000

function noop() {}

/*
*  RPC (Remote Procedure Call) is a Kademlia Standard based RPC scheme to build
*  a DHT (Distributed Hash Table). This aims at gethering quality peers and
*  complete hash table prior to starting Bittorrent-protocol download (see
*  download).
*
*  Steps :
*    - RPC Object is created and initialized with a short collection of peers
*  (here, gethered from a request to a tracker). Upon initialization, peers are
*  queried using a "ping" method
*    - Ping responses are parsed and active peers are considered as Nodes
*  (trackers offered peers with Kademlia enabled capability ), those are added
*  to the KBuckets system (see Bucket and Contact)
*    - Nodes are queried for more Nodes, those are added to the KBuckets
*    - On reaching limit (timeout or density maximum), best located peers
*  (see nodes-distance) are requested for the torrent file.
*    - Peers are fetched and emitted as event
*    -TO DO as bonus- - infoHash are announced and seeded as long as decided
*
*  STUB : see KRPC folder for queries, responses and error marshalling
*/

function RPC(opts) {
	if (!(this instanceof RPC)) return new RPC(opts)

	const self = this

	log.m('bitTorrent client warm-up...')

	if (!opts) {
			tracker.getPeers(torrentAmorce, peers => {
					self.opts = { peers }
			})
	} else {
		self.opts = opts
	}

	this.port = this.opts.port || 6881
	this.socket = this.opts.socket || dgram.createSocket('udp4')
	this.bootstrap = this.opts.peers || []
	this.socket.on('message', onMessage)
	this.socket.on('error', onError)
	this.socket.on('listening', onListening)
	this.state = 'loading'
	this._peers = 0
	this._buckets = new Nodes()
	this._buckets.once('ready', () => {
		self.goReady()
		})
	this._buckets.on('loading', stat => {
		self.unBlock(stat)
	})
	this.errors = []
	this.queries = []
	this._ids = []
	this.reqs = []
	this.peers = []
	this.torrents = []
	this._contacts = 0
	this._halveDepth = 0

	function onMessage(buf, rinfo) {
		const response = {}
		try {
			const message			= bencode.decode(buf)
			if (!message) { return }

			response.tid			= message.t && message.t.toString()
			response.type			= message.y && message.y.toString()

			if (response.tid) {
				response.req		= self.reqs[response.tid]
				response.index		= self._ids.indexOf(response.tid)
				self._ids.splice(response.index, 1)
				self.reqs.splice(response.tid, 1)
			} else return

			if (response.type === 'q') {
				self.queries = response
				self.trash = buf
			}

			if (response.type === 'r') {
				if (!Buffer.isBuffer(message.t)) return

				response.id			= message.r.id
				response.nodes		= message.r.nodes && message.r.nodes
				response.token		= message.r.token && message.r.token.toString()
				response.values		= message.r.values && message.r.values
				response.client		= !!message.v && message.v.toString('binary')
			} else if (response.type === 'e') {
				if (!Buffer.isBuffer(message.e)) return
				self.emit('error', message.e[1].toString())
			}
			if (response.index === -1 || response.tid === 0) {
				self.emit('response', message, rinfo)
				self.emit('warning', new Error('Response identification failure'))
				return
			}
			// opts = {node, ip, port, id}
			const { ip, port } = response.req
			if (response.req.r === 'ping' && (!!response.id)) {
			// PING
				if (self._contacts < MAX_NODES_LIMIT) {
						self.addNode({ nodes: response.id, ip, port, id: response.tid })
				}
			} else if (response.req.r === 'find_node') {
			// FIND_NODE
			if (!response.nodes) return
				const ids = self.parseNodes(response.nodes)
				if (ids) {
					ids.forEach(c => {
						self.ping(c)
					})
					self.emit('find_nodes')
				}
			} else if (response.req.r === 'get_peers') {
			// GET_PEERS
				if (response.values && response.values.length > 0) {
					self.announce_peer(response)
					const values = self.parseValues(response.values)
					self._peers += values.length
					const token = response.token
					self.emit('get_peers', values, token)
				}
				if (response.nodes) {
					const ids = self.parseNodes(response.nodes)
					if (ids
						// && self.torrents.indexOf(response.req.infoHash) !== -1
						&& self._peers < MAX_PEERS_LIMIT) {
						ids.forEach(p => {
							self.get_peers(p, response.req.infoHash, null)
						})
					} else if (self._peers >= MAX_PEERS_LIMIT) {
						setTimeout(() => {
							self.emit('ready', response.req.infoHash)
							if (self.torrents.length > 0) this.fetchPeers()
							else self.status = 'ready'
						}, 10000)
					}
				}
			}
		} catch (e) {
			e => {}
		}
	}

	function onError(e) {
		self.emit('error', e.message)
	}

	function onListening() {
		self.emit('listening')
	}

	try {
		if (this.opts.peers) {
			this.open()
		} else {
			const interVal = setInterval(() => {
				if (this.opts.peers) {
					clearInterval(interVal)
					this.open()
				}
			}, 20000)
		}
	} catch (e) {
		self.emit('error', e.message)
	}
}

inherits(RPC, EventEmitter)

RPC.prototype.send = function (message, contact) {
	try {
		if (contact && contact.ip && message) {
			let port = contact.port
			if (contact.port === 0) {
				port = 6881
			}
				this.socket.send(message, 0, message.length, port, contact.ip, noop)
		}
	} catch (e) {
		throw e
	}
}

RPC.prototype.open = function () {
	this.opts.peers.forEach(contact => {
		try {
			this.ping(contact)
		} catch (e) {
			this.errors.push(`RPC error on open: ${e.message}`)
		}
	})
}

RPC.prototype.goReady = function () {
	this.state = 'ready'
	this.emit('ready')
}
RPC.prototype.ping = function (contact) {
	if (contact && contact.ip && contact.port) {
		const id = anon.newKrpcId()
		this._ids.push(id)
		this.reqs[id] = { r: 'ping', ip: contact.ip, port: contact.port }
		const message = queries.BuildPingQuery(id, this.port)
		this.send(message, contact)
	}
}
RPC.prototype.find_node = function (contact, id) {
	try {
		if (!id) {
			id = anon.newKrpcId()
			this._ids.push(id)
		}
		this.reqs[id] = { r: 'find_node', ip: contact.ip, port: contact.port }
		const message = queries.BuildFindNodeQuery(id, anon.nodeId())
		this.send(message, contact)
	} catch (e) {
		throw e
	}
}

RPC.prototype.buildAddressBook = function (infoHashBuffer) {
	this.torrents.push(infoHashBuffer)
	if (this.state === 'ready') this.fetchPeers()
}

RPC.prototype.fetchPeers = function (inter) {
	this.state = 'working'
	const hash = this.torrents.pop()
	const contacts = this.getContactList(hash)
	contacts.forEach(e => {
		this.get_peers(e, hash, null)
	})
	if (!inter) {
		const interVal = setInterval(() => this.morePeers(hash), 5000)
		this.on('get_peers', () => clearInterval(interVal))
	}
}

RPC.prototype.morePeers = function (hash) {
	const contacts = this.getContactList(hash)
	contacts.forEach(e => {
		this.get_peers(e, hash)
	})
}

RPC.prototype.unBlock = function (stat) {
	if (this._stat && stat === this._stat && this._stat <= MAX_ROUTING_TABLE) {
		log.y('unblocking routing table')
		const contacts = this.getContactList(anon.nodeId())
		contacts.forEach(c => {
			this.find_node(c)
		})
	} else {
		this._stat = stat
	}
}

RPC.prototype.getContactList = function (hash) {
	return this._buckets.getContactList(hash)
}

RPC.prototype.get_peers = function (contact, infoHash, id) {
	try {
		if (!id) {
			id = anon.newKrpcId()
			this._ids.push(id)
		}
		this.reqs[id] = { r: 'get_peers', ip: contact.ip, port: contact.port, infoHash }
		const message = queries.BuildGetPeersQuery(id, infoHash)
		this.send(message, contact)
	} catch (e) {
		throw e
	}
}

RPC.prototype.stopGetPeers = function (infoHash) {
	const id = this.torrents.indexOf(infoHash)
	if (id !== -1) {
		this.torrents.splice(id, 1)
	}
}

RPC.prototype.announce_peer = function (opts, id) {
	if (!id) {
		id = anon.newKrpcId()
		this._ids.push(id)
	}
	const contact = opts.req
	const infoHash = opts.req.infoHash
	const token = opts.token
	this.reqs[id] = { r: 'announce_peer', ip: contact.ip, port: contact.port }
	const message = queries.BuildAnnouncePeer(this.port, infoHash, token)
	this.send(message, contact)
}
RPC.prototype.initializeBuckets = function (opts) {
	if (opts instanceof Contact) {
		this._buckets = new Nodes(opts)
	} else if (typeof opts === 'object'
		&& opts.contact
		&& opts.contact instanceof Contact) {
			this._buckets = new Nodes(opts.contact)
	}
}
RPC.prototype.addNode = function (opts) {
	try {
		const contact = new Contact(opts)
		this._contacts += 1
		this._buckets.addContact(contact)
		this.find_node(contact, opts.tid)
	} catch (e) {
		console.log(e)
	}
}
RPC.prototype.parseShortContacts = function (opts) {
	if (!opts) return
	const length = opts.length
	const ids = []
	for (let i = 0; i < length; i += 6) {
		const ip = `${opts.readUInt8(i)}`
			+ `.${opts.readUInt8(i + 1)}`
			+ `.${opts.readUInt8(i + 2)}`
			+ `.${opts.readUInt8(i + 3)}`
		const port = opts.readUInt16BE(i + 4)
		ids.push({ ip, port })
	}
	return ids
}
RPC.prototype.parseLongContacts = function (opts) {
	if (!opts) return
	const length = opts.length
	const ids = []
	for (let i = 0; i < length; i += 26) {
		const nodeId = opts.slice(i + 0, i + 20)
		const ip = `${opts.readUInt8(i + 20)}`
			+ `.${opts.readUInt8(i + 21)}`
			+ `.${opts.readUInt8(i + 22)}`
			+ `.${opts.readUInt8(i + 23)}`
		const port = opts.readUInt16BE(i + 24)
		ids.push({ nodeId, ip, port })
	}
	return ids
}
RPC.prototype.parseNodes = function (opts) {
	if (!opts) return
	const length = opts.length
	if (length % 6 === 0) {
		return this.parseShortContacts(opts)
	}
	if (length % 26 === 0) {
		return this.parseLongContacts(opts)
	}
}

RPC.prototype.parseValues = function (values) {
	const ids = values.map(e => {
		const ip = `${e.readUInt8(0)}`
			+ `.${e.readUInt8(1)}`
			+ `.${e.readUInt8(2)}`
			+ `.${e.readUInt8(3)}`
		const port = e.readUInt16BE(4)
		return { ip, port }
	})
	return ids
}

RPC.prototype.abortAll = function () {
	this.socket.close()
}

RPC.prototype.getErrors = function () {
	return this.errors
}

module.exports = RPC
