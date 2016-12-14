/* eslint no-bitwise: ["error", { "allow": ["<<", ">>", "&", ">>>"] }] */
/* eslint semi: ["error", "never"]*/

import inherits from 'inherits'
import { EventEmitter } from 'events'
import Bucket from './bucket'
import Contact from './contact'
import NodeTree from './lib/nodes_tree'
import anon from './anonymizer'
import log from './lib/log'

const __limit = 20000

function Nodes() {
	if (!(this instanceof Nodes)) return new Nodes()
	this._buckets = new Bucket()
	this._buckets._halveDepth = 0
	this._contacts = 0
	this.state = 'loading'
	const interVal = setInterval(() => {
		if (this._contacts > __limit) {
			this.state = 'ready'
			this.emit('ready')
			clearInterval(interVal)
			log.i(`Routing table seeded with more than ${__limit} contacts`)
		} else {
			log.i(`Waiting for ${Math.max(__limit - this._contacts, 0)} more nodes before torrenting...`)
			this.emit('loading', this._contacts)
		}
	}, 3000)
}

inherits(Nodes, EventEmitter)

Nodes.prototype.halveBucket = function (bits) {
	if (this._buckets instanceof Bucket) {
		const tmp = this._buckets.halve(bits)
		this._buckets = new NodeTree(tmp[0], tmp[1])
	} else {
		this._buckets.halve(bits)
	}
}

Nodes.prototype.getContactList = function (opts) {
	const hash = Buffer.from(opts)
	const bits = []
	for (let i = 0; i < hash.length; i += 1) {
		for (let j = 7; j >= 0; j -= 1) {
			bits.push(Boolean((hash[i] & 2 ** j) >>> j))
		}
	}
	return this._buckets.getContactList(bits)
}

Nodes.prototype.isGood = function (contact, id) {
	if (!id) {
		throw new Error({ message: 'NodeID undefined' })
	}
	const nodeId = Buffer.from(id)
	const bits = []
	for (let i = 0; i < nodeId.length; i += 1) {
		for (let j = 7; j >= 0; j -= 1) {
			bits.push(Boolean((nodeId[i] & 2 ** j) >>> j))
		}
	}
	return this._buckets.isGood(contact, bits)
}

Nodes.prototype.addContact = function (contact) {
	if (!(contact instanceof Contact)) {
		throw new Error({ message: 'Unhandled argument: contact is not a Contact' })
	}
	const bits = []
	for (let i = 0; i < contact.nodeId.length; i += 1) {
		for (let j = 7; j >= 0; j -= 1) {
			bits.push(Boolean((contact.nodeId[i] & 2 ** j) >>> j))
		}
	}
	if (bits.length === 160 && this.isGood(bits, anon.nodeId())) {
		if (this._buckets.isFull(bits)) {
			this.halveBucket(bits)
		}
		this._contacts += 1
		this._buckets.addContact(contact, bits)
	}
}

module.exports = Nodes
