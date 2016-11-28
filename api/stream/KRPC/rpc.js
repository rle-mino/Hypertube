import {inherits} from 'util'
import {EventEmitter} from 'events'
import Contact from '../contact'
import KRPCMessage from './krpcmessage'

const MESSAGE_TYPES: [
    'PING',
    'STORE',
    'FIND_NODE',
    'FIND_VALUE'
  ]

function RPC(contact, options) {
	if (!(this instanceof RPC)) return new RPC(contact, options)

	EventEmitter.call(this)
	let self = this
	options = options || {}

	if (options.replyto && !(options.replyto instanceof Contact)) throw new Error('Invalid contact')


	this._hooks = {
		before	: {},
		after	: {}
	}
	this._pendingCalls = {}
	this._contact = options.replyto || contact

	this.timeout = opts.timeout || 2000
	this.inflight = 0
	this.destroyed = false
	this.isIP = opts.isIP || isIP
	this.socket = opts.socket || dgram.createSocket('udp4')
	this.socket.on('message', onmessage)
	this.socket.on('error', onerror)
	this.socket.on('listening', onlistening)
  	this._tick = 0
	this._ids = []
	this._reqs = []
	this._timer = setInterval(check, (this.timeout / 4) | 0)



	function onlistening () {
	  self.emit('listening')
	}

	function onerror (err) {
	  if (err.code === 'EACCES' || err.code === 'EADDRINUSE') self.emit('error', err)
	  else self.emit('warning', err)
	}
	function onmessage (buf, rinfo) {
		if (self.destroyed) return
		if (!rinfo.port) return // seems like a node bug that this is nessesary?

		try {
			var message = bencode.decode(buf)
		} catch (e) {
			return self.emit('warning', e)
		}

		var type = message.y && message.y.toString()

		if (type === 'r' || type === 'e') {
			if (!Buffer.isBuffer(message.t)) return

			try {
				var tid = message.t.readUInt16BE(0)
			} catch (err) {
				return self.emit('warning', err)
			}

			var index = self._ids.indexOf(tid)
			if (index === -1 || tid === 0) {
				self.emit('response', message, rinfo)
				self.emit('warning', new Error('Unexpected transaction id: ' + tid))
			  return
			}

			var req = self._reqs[index]
			if (req.peer.host !== rinfo.address) {
				self.emit('response', message, rinfo)
				self.emit('warning', new Error('Out of order response'))
				return
			}

			self._ids[index] = 0
			self._reqs[index] = null
			self.inflight--

			if (type === 'e') {
				var isArray = Array.isArray(message.e)
				var err = new Error(isArray ? message.e.join(' ') : 'Unknown error')
				err.code = isArray && message.e.length && typeof message.e[0] === 'number' ? message.e[0] : 0
				req.callback(err, message, rinfo, req.message)
				self.emit('update')
				self.emit('postupdate')
				return
			}

			req.callback(null, message, rinfo, req.message)
			self.emit('update')
			self.emit('postupdate')
			self.emit('response', message, rinfo)
		} else if (type === 'q') {
			self.emit('query', message, rinfo)
		} else {
			self.emit('warning', new Error('Unknown type: ' + type))
		}
	}
}



	this.open()
}

inherits(RPC, EventEmitter)

RPC.prototype.address = function () {
  return this.socket.address()
}

RPC.prototype.response = function (peer, req, res, cb) {
  this.send(peer, {t: req.t, y: 'r', r: res}, cb)
}

RPC.prototype.error = function (peer, req, error, cb) {
  this.send(peer, {t: req.t, y: 'e', e: [].concat(error.message || error)}, cb)
}

RPC.prototype.send = function (peer, message, cb) {
  var buf = bencode.encode(message)
  this.socket.send(buf, 0, buf.length, peer.port, peer.address || peer.host, cb || noop)
}

RPC.prototype.bind = function (port, cb) {
  this.socket.bind(port, cb)
}

RPC.prototype.destroy = function (cb) {
  this.destroyed = true
  clearInterval(this._timer)
  if (cb) this.socket.on('close', cb)
  for (var i = 0; i < this._ids.length; i++) this._cancel(i)
  this.socket.close()
}

RPC.prototype.query = function (peer, query, cb) {
  if (!cb) cb = noop
  if (!this.isIP(peer.host)) return this._resolveAndQuery(peer, query, cb)

  var message = {
    t: new Buffer(2),
    y: 'q',
    q: query.q,
    a: query.a
  }

  var req = {
    ttl: 4,
    peer: peer,
    message: message,
    callback: cb
  }

  if (this._tick === 65535) this._tick = 0
  var tid = ++this._tick

  var free = this._ids.indexOf(0)
  if (free === -1) free = this._ids.push(0) - 1
  this._ids[free] = tid
  while (this._reqs.length < free) this._reqs.push(null)
  this._reqs[free] = req

  this.inflight++
  message.t.writeUInt16BE(tid, 0)
  this.send(peer, message)
  return tid
}

RPC.prototype.cancel = function (tid, err) {
  var index = this._ids.indexOf(tid)
  if (index > -1) this._cancel(index, err)
}

RPC.prototype._cancel = function (index, err) {
  var req = this._reqs[index]
  this._ids[index] = 0
  this._reqs[index] = null
  if (req) {
    this.inflight--
    req.callback(err || new Error('Query was cancelled'), null, req.peer)
    this.emit('update')
    this.emit('postupdate')
  }
}

RPC.prototype._resolveAndQuery = function (peer, query, cb) {
  var self = this

  dns.lookup(peer.host, function (err, ip) {
    if (err) return cb(err)
    if (self.destroyed) return cb(new Error('k-rpc-socket is destroyed'))
    self.query({host: ip, port: peer.port}, query, cb)
  })
}

function noop () {}

RPC.prototype.open = function(cb) {
	var self = this
	if (cb) {
		self.once('ready, callback')
	}

	self.readyState = 1

	self._trigger('before:open', [], () => {
		self._open(() => {
			self.readyState = 2
			self.emit('ready')
			self._trigger('after:open')
		})

		self._expirator = setInterval(
			self._expireCalls.bind(self),
			5005
		)
	})
}

RPC.prototype.close = cb => {
	let self = this
	self.readyState = 1

	self._trigger('before:close', [], () => {
		self._close()
		self.readystate = 0
		self._trigger('after:close')
		clearInterval(self._expirator)

		if (cb) {
			cb()
		}
	})
}

RPC.prototype.send = (contact, message, cb) => {
	let self = this
	contact = this._createContact(contact)

	if (!(contact instanceof Contact)) throw new Error('Invalid contact')
	if (!(message instanceof KRPCMessage)) throw new Error('Invalid Message')

	if (KRPCMessage.isRequest(message)) {
		console.log('sending %s message to %j', message.method, contact)
	} else {
		console.log('replying to message from %s', message.id)
	}

	this._trigger('before:serialize', [message], () => {
		let serialized = message.serialize()

		self._triger('after:serialize')
		self.trigger('before:send', [serialized, contact, () => {
			if (KRPCMessgae.isRequest(message) && typeof cb === 'function') {
				console.log('queueing cb for response to %s', message.id)

				self._pendingCalls[message.id] = {
					timestamp: Date.now(),
					callback: cb,
					contact,
					message,
				}
			} else {
				console.log('not waiting on callback for message %s', message.id)
			}

			self._send(message.serialize(), contact)
			self._trigger('after:send')
		}])
	})
}


RPC.prototype.receive = buffer => {
	let self = this, message, contact
	function deserialize() {
		message = KRPCMessage.fromBuffer(buffer)

		self._trigger('after:deserialize')

		if (KRPCMessage.isRequest(message)) {
			contact = self._createContact(message.params.contact)
		} else {
			contact = self._createContact(message.result.contact)
		}

		console.log('received valid message from %j', contact)
	}

	if (!buffer) {
		console.log('missing or empty reply from contact');
		return self.emit('MESSAGE_DROP')
	}

	this._trigger('before:deserialize', [buffer], () => {
		try {
			deserialize()
		} catch (e) {
			throw e
			return self.emit('MESSAGE_DROP')
		}

		self.emit('CONTACT_SEEN', contact)
		self._trigger('before:receive', [message, contact], () => {
			self._execPendingCallback(message, contact)
		})
	})
}

RPC.prototype.before = (event, handler) => {
	return this._register(before, event, handler)
}

RPC.prototype.after = (event, handler) => {
	return this._register('after', event, handler)
}

RPC.prototype._register = (time, event, handler) => {
	if (Object.keys(this._hooks).indexOf(time) === -1) throw new Error('Invalid event hook')
	if (typeof event !== 'string') throw new Error('Invalid event')
	if (typeof handler !== 'function') throw new Error(Invalid handler)

	if (!this._hooks[time][event]) {
		this._hooks[time][event] = []
	}

	this._hooks[time][event],push(handler)

	return this
}

RPC.prototype._trigger = (event, args, complete) => {
	let self = this,
	hook = event.split(':')[0],
	name = event.split(:)[1],
	cb = complete || () => {}

	if (!this._hooks[hook][name]) {
		return cb()
	}

	let stack = this._hooks[hook][name].map(fn => {
		return fn.bind.apply(fn, [self].concat(args || []))
	})

	async.series(stack, err => {
		if (err) {
			return self.emit('error', err)
		}
		cb()
	})
}

RPC.prototype._createContact = options => {
	return new this._contact.constructor(options)
}

RPC.prototype._execPendingCallback = message => {
	let pendingCall = this._pendingCalls[message.id]

	console.log('checking pending rpc callback for %s', message.id)

	if (KRPCMessage.isResponse(message) && pendingCall) {
		pendingCall.cb(null, message)
		delete this._pendingCalls[message.id]
	} else if (KRPCMessage.isRequest(message)) {
		if (MESSAGE_TYPES.indexOf(message.method) === -1){
			this.emit('MESSAGE_DROP', message.serialize())
			console.log('message references unsupported method %s', message.method)
		} else {
			this.emit(message.method, message)
		}
	}else {
		this.emit('MESSAGE_DROP', message.serialize())
		console.log('dropping received late response to %s', message.id)
	}
	this._trigger('after:receive', [])
}

RPC.prototype._expireCalls = () => {
	console.log('checking pending rpc callbacks for expirations')

	for (let rpcId in this.pendingCalls) {
		let pendingCall = this._pendingCalls[rpcId]
		let timePassed = Date.now() - pendingCall.timestamp

		if (timePassed > 5005) {
			console.log('rpc call %s timed out', rpcId)
			this.emit('TIMEOUT', pendingCall.contact, pendingCall.message)
			pendingCall.callback(new Error(`RPC with ID '${rpcId}' timed out`))
			delete this._pendingCalls[rpcId]
		}
	}
}

RPC.prototype._close = () => {
	throw new Error('Method not implemented')
}

RPC.prototype._send = () => {
	throw new Error('Method not implemented')
}

RPC.prototype._open = done => {
	setImmediate(done)
}

module.exports = RPC
