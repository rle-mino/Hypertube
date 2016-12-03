import chalk from 'chalk'
import LRU from 'lru'
import anon from './anonymizer'
import Contact from './contact'
import {EventEmitter} from 'events'
import inherits from 'inherits'
import bencode from 'bencode'
import crypto from 'crypto'
import _ from 'lodash'
import XOR from './lib/nodes_distance'

const K = 20;

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))

function Bucket() {
	if (!(this instanceof Bucket)) return new Bucket()
	const self = this

	this._contacts = []
	this.nodes = new LRU({maxAge: 15 * 60 * 1000, max: K})
	setInterval(function () {
		ilog(`bucket ${self.min()} has a population of ${self.getSize()}`)
	}, 1000);
}

Bucket.prototype.getSize = function() {
	return this._contacts.length
}

Bucket.prototype.getContactList = () => {
	return _.clone(this._contacts)
}

Bucket.prototype.getContact = function(index) {
	if (index < 0) throw new Error('Contact index cannot be negative')
	return this._contacts[index] || null
}

Bucket.prototype.addContact = function (contact) {
	if (!(contact instanceof Contact)) throw new Error('Invalid contact')

	if (this.isFull()) {
		// before discarding, a request should be sent to the least recently
		// seen member of the bucket (first member) and a response awaited
		// before:
		// 	 a) putting least recently seen as most recently seen (tail).
		// 	 b) or removing least recently seen and adding new contail as tail.
		//
		// Note: according to Gnutella statistics, oldest live contacts are
		// kinner to stay alive than youngest.
		//
		// Such is done in the Buckets manager in nodes.js
		ylog('bucket full ?')

		return false
	}
		try {
			let temp = this._contacts
			if (!this.hasContact(contact.nodeId)) {
				let index = _.sortedIndexBy(temp, contact, contact => {
					return contact.lastSeen
				})
				this._contacts.splice(index, 0, contact)
				ylog('+')
			} else {
				elog('contact already exists')
			}
			return true
		} catch (e) {
			elog('error in add Contact : ' + e.message)
		}

}

Bucket.prototype.removeContact = function(contact) {
	const index = this.indexOf(contact)

	if (index >= 0) {
		this._contacts.splice(index, 1)
		return true
	}
	return false
}

Bucket.prototype.hasContact = function(contact) {
	try {
		for (let i = 0; i < this.getSize(); i++) {
			if (this.getContact(i).nodeId === contact.nodeId) {
				return i
			}
		}
		return false
	} catch(e) {
		ylog('hascontact' + e.messages)
	}

}

Bucket.prototype.indexOf = function (index) {
	return this._contacts.indexOf(index)
}

//   isFull() is not a convenient implementation of the BEP_0005 from Bittorrent
// but it is less (coding) time consuming than pinging the oldest node and
// eventually removing it. A proper implementation would be verifying last seen
// for every contact and if the oldest contact hasn't been seen for more that
// 15min, pinging it before eventually removing it. If and only if not removed,
// a Bucket should be considered as Full.
//
// if time allows, this method will be properly implemented (so would be
// addContact).

Bucket.prototype.halve = function(bits) {
	let tmp = []
	const depth = 160 - bits.length
	const split = (d) => {

		const tmp = new Bucket()
		tmp._halveDepth = (depth + 1)
		const zeros = this._contacts.filter(e => {
			let buf = Buffer.alloc(1)
			e.nodeId.copy(buf, 0, 19 - Math.floor(depth / 8), 20 - Math.floor(depth / 8))
			log(`halving for depth of ${depth} discriminant ${d} and actual value ${buf}`)
			return ((buf[0] & Math.pow(2,depth % 8)) >> depth === d)
		})
		for (let i = 0; i < zeros.length; i++) {
			tmp.addContact(zeros[i])
		}
		return tmp
	}
	tmp[0] = split(0)
	tmp[1] = split(1)
	return tmp
}

Bucket.prototype.isFull = function() { return (this.getSize() === K) }
Bucket.prototype.isEmpty = function() { return (this.getSize() === 0) }

Bucket.prototype.min = function() {
	if (this._contacts.length === 0) return
	let min = Buffer.from(this._contacts[0].nodeId)
	for (let i = 1; i < this._contacts.length; i++) {
		min = (min.compare(Buffer.from(this._contacts[i].nodeId)) < 0)
			? min
			: Buffer.from(this._contacts[i].nodeId)
	}
	return min
}
Bucket.prototype.max = function() {
	if (this._contacts.length === 0) return
	let max = Buffer.from(this._contacts[0].nodeId)
	for (let i = 1; i < this._contacts.length; i++) {
		max = (max.compare(Buffer.from(this._contacts[i].nodeId)) > 0)
			? max
			: Buffer.from(this._contacts[i].nodeId)
	}
	return max

}

module.exports = Bucket
