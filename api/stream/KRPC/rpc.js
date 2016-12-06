/* eslint semi: ["error", "never"]*/
import {inherits} from 'util'
import {EventEmitter} from 'events'
import bencode from 'bencode'
import Contact from '../contact'
import KRPCMessage from './krpcmessage'
import Bucket from '../bucket'
import Nodes from '../node'
import dgram from 'dgram'
import * as queries from './queries'
import * as responses from './responses'
import * as errors from './errors'
import anon from '../anonymizer'
import chalk from 'chalk'

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))

const MESSAGE_TYPES = [
    'PING',
    'STORE',
    'FIND_NODE',
    'FIND_VALUE'
  ]


function noop() {}

// RPC (Remote Procedure Call) is a Kademlia Standard based RPC scheme to build
// a DHT (Distributed Hash Table). This aims at gethering quality peers and
// complete hash table prior to starting Bittorrent-protocol download (see
// download).
//
// Steps :
//   - RPC Object is created and initialized with a short collection of peers
// (here, gethered from a request to a tracker). Upon initialization, peers are
// queried using a "ping" method
//   - Ping responses are parsed and active peers are considered as Nodes
// (trackers offered peers with Kademlia enabled capability ), those are added
// to the KBuckets system (see Bucket and Contact)
//   - Nodes are queried for more Nodes, those are added to the KBuckets
//   -TO DO- - On reaching limit (timeout or density maximum), best located peers
// (see nodes-distance) are requested for the torrent file.
//   -TO DO- - infoHash is downloaded and sent to the downloader, witch uses a
// ifferent protocol
//   -TO DO as bonus- - infoHash and peers are announced and seeded as long as
// decided
//
// STUB : see KRPC folder for queries, responses and error marshalling

function RPC(opts) {
	if (!(this instanceof RPC)) return new RPC(opts)

	const self = this

	if (!opts) opts = {}

	this.port = opts.port || 1 + Math.floor(Math.random() * 65535)
	this.socket = opts.socket || dgram.createSocket('udp4')
	this.bootstrap = opts.peers || []
	this.socket.on('message', onMessage)
	this.socket.on('error', onError)
	this.socket.on('listening', onListening)
	this.state = 'loading'
	this._buckets = new Nodes()
	this._buckets.once('ready', () => {
		self.goReady()
		})
	this.errors = []
	this.queries = []
	this._ids = []
	this.reqs = []
	this.peers = []
	this.torrents = []
	this._halveDepth = 0

	function onMessage(buf, rinfo) {
		const response = {}
		try {
			const message	= bencode.decode(buf)

			response.tid			= message.t && message.t.toString()
			response.type			= message.y && message.y.toString()

			if (response.tid) {
				response.req			= self.reqs[response.tid]
				response.index		= self._ids.indexOf(response.tid)
			} else return

			if (response.type === 'q') {
				self.queries.push(response)
				self.emit('query')
			}

			if (response.type === 'r') {
				if (!Buffer.isBuffer(message.t)) return

				response.id			= message.r.id
				response.nodes		= message.r.nodes && message.r.nodes
				response.token		= message.r.token && message.r.token.toString()
				response.values		= message.r.values && message.r.values.map(e => e.toString())
				response.client			= !!message.v && message.v.toString('binary')
			} else if (response.type === 'e') {
				if (!Buffer.isBuffer(message.t)) return
				self.emit('error', message.e)
			}
			if (response.index === -1 || response.tid === 0) {
				self.emit('response', message, rinfo)
				self.emit('warning', new Error('Response identification failiure'))
				return
			}
			// opts = {node, ip, port, id}
			const { ip, port } = response.req
			if (response.req.r === 'ping' && (!!response.id)) {
			// PING
				self.addNode({ nodes: response.id, ip, port, id: response.tid })
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
				if (response.values) {
					self.emit('get_peers', response.values)
				} else if (response.nodes) {
					const ids = self.parseNodes(response.nodes)
					if (ids && this.torrent.indexOf(response.req.infoHash) !== -1) {
						ids.forEach(p => {
							self.get_peers(p, response.req.infoHash, null)
						})
					}
				}
			}
		} catch (e) {
			self.errors.push(e)
		}
	}

	function onError(e) {
		self.emit('error', e)
	}

	function onListening() {
		self.emit('listening')
	}

	try {
		this.open()
		setTimeout(() => {
		}, 6000)
	} catch (e) {
		this.errors.push(e)
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
		this.errors.push(e)
	}
}

RPC.prototype.open = function () {
	this.bootstrap.forEach(contact => {
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
		this.errors.push(e)
	}
}

RPC.prototype.buildAddressBook = function (infoHash) {
	this.torrents.push(infoHash)
	this.peers[this.torrents.indexOf(infoHash)] = []
	const contacts = this.getContactList(infoHash)
	contacts.forEach(e => {
		this.get_peers(e, infoHash, null)
	})
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
		this.errors.push(e)
	}
}

RPC.prototype.stopGetPeers = function (infoHash) {
	const id = this.torrents.indexOf(infoHash)
	if (id !== -1) {
		this.torrents.splice(id, 1)
	}
}

RPC.prototype.anounce_peer = function (contact, impliedPort, infoHash, token, id) {
	this.reqs[id].r = 'announce_peer'
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
		this._buckets.addContact(contact)
		this.find_node(contact, opts.tid)
	} catch (e) {
		this.errors.push(e)
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

RPC.prototype.getErrors = function () {
	return this.errors
}

module.exports = RPC
