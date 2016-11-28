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

	options = options || {}

	if (options.replyto && !(options.replyto instanceof Contact)) throw new Error('Invalid contact')

	this._hooks = {
		before	: {},
		after	: {}
	}
	this._pendingCalls = {}
	this._contact = options.replyto || contact
	this.open()
}

inherits(RPC, EventEmitter)

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
