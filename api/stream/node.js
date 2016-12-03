import chalk from 'chalk'
import LRU from 'lru'
import anon from './anonymizer'
import {EventEmitter} from 'events'
import inherits from 'inherits'
import bencode from 'bencode'
import crypto from 'crypto'
import XOR from './lib/nodes_distance'
import Bucket from './bucket'
import Contact from './contact'
import NodeTree from './lib/nodes_tree'


const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))


const __rotate_interval = 5 * 60 * 1000

module.exports = Nodes

function Nodes () {
	if (!(this instanceof Nodes)) return new Nodes ()
	this._buckets = new Bucket()
	this._buckets._halveDepth = 0
}

inherits(Nodes, EventEmitter)

Nodes.prototype.findBucket = function (contact) {
	let bucketId
	for (let i = 0; i < this._slices.length; i++) {
		bucketId = bucketId ?
			(XOR(this._slices[i], contact.nodeId) < XOR(this._slices[bucketId], contact.nodeId) ? i : bucketId)
			: i
	}
	return bucketId

}

Nodes.prototype.halveBucket = function(bits) {
	const tmp = this._buckets.halve(bits)
	if (this._buckets instanceof Bucket) {
		this._buckets = new NodeTree(tmp[0], tmp[1])
	} else {
		this.buckets.addNode(tmp[0], tmp[1], bits)
	}

}

Nodes.prototype.addContact = function (contact) {
	if (!(contact instanceof Contact)) {
		throw new Error({message: 'Unhandled argument: contact is not a Contact'})
	}

	let bits = []
	for (let i = 0; i < contact.nodeId.length; i++){
		bits.push(Boolean((contact.nodeId[i] << 7) >> 7))
		bits.push(Boolean((contact.nodeId[i] << 6) >> 7))
		bits.push(Boolean((contact.nodeId[i] << 5) >> 7))
		bits.push(Boolean((contact.nodeId[i] << 4) >> 7))
		bits.push(Boolean((contact.nodeId[i] << 3) >> 7))
		bits.push(Boolean((contact.nodeId[i] << 2) >> 5))
		bits.push(Boolean((contact.nodeId[i] << 1) >> 6))
		bits.push(Boolean(contact.nodeId[i] >> 7))
	}
	Buffer.from(contact.nodeId)

	if (this._buckets.isFull(bits)) {
		this.halveBucket(bits)
	}
	this._buckets.addContact(contact, bits)
}
