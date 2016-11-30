import chalk from 'chalk'
import LRU from 'lru'
import anon from './anonymizer'
import Contact from './contact'
import {EventEmitter} from 'events'
import inherits from 'inherits'
import bencode from 'bencode'
import crypto from 'crypto'
import _ from 'lodash'

const K = 20;

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))

function Bucket() {
	if (!(this instanceof Bucket)) return new Bucket()

	this._contacts = []
	this.nodes = new LRU({maxAge: 15 * 60 * 1000, max: K})
}

Bucket.prototype.getSize = function() {
	return this._contacts.length
}

Bucket.prototype.getContactList = () => {
	return _.clone(this._contacts)
}

Bucket.prototype.getContact = index => {
	if (index < 0) throw new Error('Contact index cannot be negative')

	return this._contacts[index] || null
}

Bucket.prototype.addContact = function (contact) {
	if (!(contact instanceof Contact)) throw new Error('Invalid contact')

	if (this.getSize() === K) {
		// before discarding, a request should be sent to the least recently
		// seen member of the bucket (first member) and a response awaited
		// before:
		// 	 a) putting least recently seen as most recently seen (tail).
		// 	 b) or removing least recently seen and adding new contail as tail.
		//
		// Note: according to Gnutella statistics, oldest live contacts are
		// kinner to stay alive than youngest.

		return false
	}

	if (!this.hasContact(contact.nodeId)) {
		let index = _.sortedIndex(this._contacts, contact, contact => {
			return contact.lastSeen
		})

		this.contacts.splice(index, 0, contact)
	}
	ylog('+')
	return true
}

Bucket.prototype.removeContact = contact => {
	const index = this.indexOf(contact)

	if (index >= 0) {
		this._contacts.splice(index, 1)
		return true
	}
	return false
}

Bucket.prototype.hasContact = function(contact) {
	for (let i = 0; i < this.getSize(); i++) {
		if (this.getContact(i).nodeId === contact.nodeId) {
			return i
		}
	}
	return -1;
}

Bucket.prototype.indexOf = function (index) {
	return this._contacts.indexOf(index)
}

module.exports = Bucket
