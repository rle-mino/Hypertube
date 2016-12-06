/* eslint no-bitwise: ["error", { "allow": ["<<", ">>", "&", ">>>"] }] */
import chalk from 'chalk'
import inherits from 'inherits'
import bencode from 'bencode'
import crypto from 'crypto'
import { EventEmitter} from 'events'
import XOR from './lib/nodes_distance'
import Bucket from './bucket'
import Contact from './contact'
import NodeTree from './lib/nodes_tree'
import anon from './anonymizer'


const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))
const mlog = m => process.stdout.write(chalk.magenta(m))


function Nodes() {
	if (!(this instanceof Nodes)) return new Nodes()
	this._buckets = new Bucket()
	this._buckets._halveDepth = 0
	this._contacts = 0
	this.state = 'loading'
	setInterval(() => {
		if (this._contacts > 3500 && this.state !== 'ready') {
			this.state = 'ready'
			this.emit('ready')
		}
	}, 15000)
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
