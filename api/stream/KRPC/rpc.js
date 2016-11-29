import {inherits} from 'util'
import {EventEmitter} from 'events'
import bencode from 'bencode'
import Contact from '../contact'
import KRPCMessage from './krpcmessage'
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

async function RPC(contact, opts) {
	if (!(this instanceof RPC)) return await new RPC(contact, opts)
	console.log(' ')

	let self = this

	EventEmitter.call(this)
	if (!opts) opts = {}

	this.port = opts.port
	this.socket = opts.socket || dgram.createSocket('udp4')
	this.bootstrap = opts.peers || []
	this.socket.on('message', onMessage)
	this.socket.on('error', onError)
	this.socket.on('listening', onListening)
	this._ids = []
	this.reqs = []

	function onMessage (buf, rinfo) {
		ilog(':')
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

				console.log(message.r, message.r.nodes)

				response.id			= message.r.id.readUInt32BE(0)
				response.nodes		= message.r.nodes && message.r.nodes.toString()
				response.token		= message.r.token && message.r.token.toString()
				response.values		= message.r.values && message.r.values.map(e => {return e.toString()})

			} else if (response.type === 'e') {
				if (!Buffer.isBuffer(message.t)) return
				elog(message.e[1].toString())
			}

			if (response.index === -1 || response.tid === 0) {
				elog('!')
				self.emit('response, message, rinfo')
				self.emit('warning', new Error('Response identification failiure'))
				return
			}
			console.log('response', response)
			// opts = {node, ip, port}
			const {ip, port} = response.req
			if (response.req.r === 'ping') {self.addNode({nodes: response.id, ip, port})}
			else if (response.req.r === '') elog('!')
		} catch(e) {
			elog('!')
			throw e
		}
	}

	function onError(e) {
		self.emit('error', e)
		elog('!')
	}

	function onListening() {
		ylog('?')
		self.emit('listening')

	}

	try {
		await this.open()
	} catch(e) {
		elog(e.message)
	}

	self.on('listening', () => {
		ilog('?')
	})
}

inherits(RPC, EventEmitter)

RPC.prototype.open = async function() {
	this.bootstrap.forEach(contact => {
		const id = anon.newKrpcId()
		try {
			this.ping(contact, id)
		} catch(e){
			elog(`open error: ${e.message}`)
		}
	})
}

RPC.prototype.ping = async function(contact, id) {
	this._ids.push(id)
	this.reqs[id] = {r: 'ping', ip: contact.ip, port: contact.port}
	try {
		const message = await queries.BuildPingQuery(id, this.port)
		this.send(message, contact)
	} catch(e) {
		elog('!')
	}
}
RPC.prototype.find_node = function(contact, node, id){
	this.reqs[id] = 'find_node'
}
RPC.prototype.get_peers = function(contact, node, infoHash, id){
	this.reqs[id] = 'get_peers'
}
RPC.prototype.anounce_peer = function(contact, impliedPort, infoHash, token, id){
	this.reqs[id] = 'announce_peer'
}
RPC.prototype.send = function (message, contact) {
	ilog('.')
	this.socket.send(message, 0, message.length, contact.port, contact.ip, noop)
}
RPC.prototype.addNode = function (opts) {
	ylog('!')
	const contact = new Contact(opts)
}

module.exports = RPC
