/* eslint no-bitwise: ["error", { "allow": ["<<", ">>", "&"] }] */
/* eslint semi: ["error", "never"]*/

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

const K = 40

function Bucket() {
	if (!(this instanceof Bucket)) return new Bucket()
	this._contacts = []
}

Bucket.prototype.getSize = function () {
	return this._contacts.length
}

Bucket.prototype.isGood = function () {
	return true
}

Bucket.prototype.getContactList = function () {
	return _.clone(this._contacts)
}

Bucket.prototype.getContact = function (index) {
	if (index < 0) throw new Error('Contact index cannot be negative')
	if (index >= K) throw new Error('Contact index out of range')
	return this._contacts[index] || null
}

Bucket.prototype.addContact = function (contact, bits) {
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
		return false
	}
		try {
			const temp = this._contacts
			if (!this.hasContact(contact.nodeId)) {
				const index = _.sortedIndexBy(temp, contact, contact => {
					return contact.lastSeen
				})
				this._contacts.splice(index, 0, contact)
			}
			return true
		} catch (e) {
			throw e
		}
}

Bucket.prototype.removeContact = function (contact) {
	const index = this.indexOf(contact)

	if (index >= 0) {
		this._contacts.splice(index, 1)
		return true
	}
	return false
}

Bucket.prototype.hasContact = function (contact) {
	try {
		for (let i = 0; i < this.getSize(); i += 1) {
			if (this.getContact(i).nodeId === contact.nodeId) {
				return i
			}
		}
		return false
	} catch (e) {
		throw e
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

Bucket.prototype.halve = function (bits) {
	const tmp = []
	const depth = 160 - bits.length
	const byte = Math.floor(depth / 8)
	const bit = 7 - (depth % 8)
	const split = (d) => {
		const tmpB = new Bucket()
		tmpB._halveDepth = (depth + 1)
		const zeros = this._contacts.filter(e => {
			const buf = Buffer.alloc(1)
			e.nodeId.copy(buf, 0, byte, byte + 1)
			return (((buf[0] & (2 ** bit)) >> bit) === d)
		})
		for (let i = 0; i < zeros.length; i += 1) {
			tmpB.addContact(zeros[i])
		}
		return tmpB
	}
	tmp[0] = split(0)
	tmp[1] = split(1)
	return tmp
}

Bucket.prototype.isFull = function () { return (this.getSize() === K) }
Bucket.prototype.isEmpty = function () { return (this.getSize() === 0) }

Bucket.prototype.min = function () {
	if (this._contacts.length === 0) return
	let min = Buffer.from(this._contacts[0].nodeId)
	for (let i = 1; i < this._contacts.length; i++) {
		min = (min.compare(Buffer.from(this._contacts[i].nodeId)) < 0)
			? min
			: Buffer.from(this._contacts[i].nodeId)
	}
	return min
}
Bucket.prototype.max = function () {
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
