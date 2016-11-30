import {inherits} from 'util'
import {EventEmitter} from 'events'
import bencode from 'bencode'
import Contact from '../contact'
import KRPCMessage from './krpcmessage'
import Bucket from '../bucket'
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
//   -DOING- - Nodes are queried for more Nodes, those are added to the KBuckets
//   -TO DO- - Of reaching limit (timeout or density maximum), best located peers
// (see nodes-distance) are requested for the torrent file.
//   -TO DO- - infoHash is downloaded and sent to the downloader, witch uses a
// ifferent protocol
//   -TO DO as bonus- - infoHash and peers are announced and seeded as long as
// decided
//
// STUB : see KRPC folder for queries, responses and error marshalling

async function RPC(infoHash, opts) {
	if (!(this instanceof RPC)) return await new RPC(contact, opts)
	console.log(' ')

	let self = this

	EventEmitter.call(this)
	if (!opts) opts = {}

	this.port = opts.port
	this.infoHash = infoHash
	this.socket = opts.socket || dgram.createSocket('udp4')
	this.bootstrap = opts.peers || []
	this.socket.on('message', onMessage)
	this.socket.on('error', onError)
	this.socket.on('listening', onListening)
	this.errors = []
	this._ids = []
	this.reqs = []

	function onMessage (buf, rinfo) {
		let response = {}
		try {
			let message	= bencode.decode(buf)

			response.tid			= message.t && message.t.toString()
			response.type			= message.y && message.y.toString()
			response.req			= self.reqs[response.tid]

			if (response.tid) {
				response.index		= self._ids.indexOf(response.tid)
			}

			if (response.type === 'r') {
				if (!Buffer.isBuffer(message.t)) return

				response.id			= message.r.id
				response.nodes		= message.r.nodes && message.r.nodes
				response.token		= message.r.token && message.r.token.toString()
				response.values		= message.r.values && message.r.values.map(e => {return e.toString()})

			} else if (response.type === 'e') {
				if (!Buffer.isBuffer(message.t)) return
				elog(message.e[1].toString())
			}

			if (response.index === -1 || response.tid === 0) {
				elog('response error')
				self.emit('response', message, rinfo)
				self.emit('warning', new Error('Response identification failiure'))
				return
			}
			// opts = {node, ip, port, id}
			const {ip, port} = response.req
			if (response.req.r === 'ping') {
				ilog(':')
				self.addNode({nodes: response.id, ip, port, id: response.tid})
			}
			else if (response.req.r === 'find_node') {
				ilog(response.id)
				self.parseNodes(response.nodes)
			}
			else if (response.req.r === '') elog('error message')
		} catch(e) {
			this.errors.push(e)
		}
	}

	function onError(e) {
		self.emit('error', e)
		elog('on error !')
	}

	function onListening() {
		self.emit('listening')

	}

	try {
		await this.open()
	} catch(e) {
		this.errors.push(e)
	}

	self.on('listening', () => {
		ilog('?')
	})
}

inherits(RPC, EventEmitter)

RPC.prototype.open = async function() {
	this.bootstrap.forEach(contact => {
		try {
			this.ping(contact)
		} catch(e){
			elog(`RPC error on open: ${e.message}`)
		}
	})
}

RPC.prototype.ping = function(contact) {
	const id = anon.newKrpcId()
	this._ids.push(id)
	this.reqs[id] = {r: 'ping', ip: contact.ip, port: contact.port}
	const message = queries.BuildPingQuery(id, this.port)
	this.send(message, contact)
}
RPC.prototype.find_node = function(contact, id){
	if (!id) {
		id = anon.newKrpcId()
		this._ids.push(id)
	}
	this.reqs[id] = {r: 'find_node', ip: contact.ip, port: contact.port}
	try {
		const message = queries.BuildFindNodeQuery(id, anon.nodeId())
		this.send(message, contact)
	} catch (e) {
		this.errors.push(e)
	}
}
RPC.prototype.get_peers = function (contact, id) {
	if (!id) {
		id = anon.newKrpcId()
		this._ids.push(id)
	}
	this.reqs[id] = {r: 'get_peers', ip: contact.ip, port: contact.port}
	try {
		const message = queries.BuildFindNodeQuery(id, anon.nodeId())
		this.send(message, contact)
	} catch (e) {
		this.errors.push(e)
	}
}
RPC.prototype.anounce_peer = function (contact, impliedPort, infoHash, token, id) {
	this.reqs[id].r = 'announce_peer'
}
RPC.prototype.send = function (message, contact) {
	ilog('.')
	this.socket.send(message, 0, message.length, contact.port, contact.ip, noop)
}
RPC.prototype.initializeBuckets = function (opts){
	this._buckets = new Bucket()
	if (!opts) {
		return
	} else if (opts instanceof Contact) {
		this._buckets.addContact(opts)
	} else if (typeof opts === Object
		&& opts.contact
		&& opts.contact instanceof Contact) {
		this._buckets.addContact(opts.contact)
	}
	return
}
RPC.prototype.addNode = function (opts) {
	const contact = new Contact(opts)
	if (!this._buckets || this._buckets.length === 0) {
		this.initializeBuckets(contact)
	} else {
		this._buckets.addContact(contact)
	}
	this.find_node(contact, opts.tid)

}
RPC.prototype.parseShortContacts = function (opts) {
	if (!opts) return
	const length = opts.length
	let ids = []
	for (let i = 0; i < length; i += 6) {
		const ip = `${opts.readUInt8(i)}`
			+`.${opts.readUInt8(i + 1)}`
			+`.${opts.readUInt8(i + 2)}`
			+`.${opts.readUInt8(i + 3)}`
		const port = opts.readUInt16BE(i + 4)
		ids.push({nodeId, ip, port})
	}
	ids.forEach(c => {
		this.ping(c)
	})
}
RPC.prototype.parseLongContacts = function (opts) {
	if (!opts) return
	const length = opts.length
	let ids = []
	for (let i = 0; i < length; i += 26) {
		const nodeId = opts.slice(i + 0, i + 20)
		const ip = `${opts.readUInt8(i + 20)}`
			+`.${opts.readUInt8(i + 21)}`
			+`.${opts.readUInt8(i + 22)}`
			+`.${opts.readUInt8(i + 23)}`
		const port = opts.readUInt16BE(i + 24)
		ids.push({nodeId, ip, port})
	}
	ids.forEach(c => {
		this.ping(c)
	})
}
RPC.prototype.parseNodes = function (opts) {
	if (!opts) return
	const length = opts.length
	if (length % 6 === 0) {
		this.parseShortContacts(opts)
	}
	if (length % 26 === 0) {
		this.parseLongContacts(opts)
	}
}

module.exports = RPC
