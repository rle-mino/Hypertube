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
}

Bucket.prototype.getSize = () => {
	return this._contacts.length
}

Bucket.prototype.getContactList = () => {
	return _.clone(this.contacts)
}

Bucket.prototype.getContact = index => {
	if (index < 0) throw new Error('Contact index cannot be negative')

	return this._contacts[index] || null
}

Bucket.prototype.addContact = contact => {
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

	if (!this.hasContact(contact.nodeID)) {
		let index = _.sortedIndex(this._contacts, contact, contact => {
			return contact.lastSeen
		})

		this.contacts.splice(index, 0, contact)
	}

	return true
}

Bucket.prototype.removeContact = contact => {
	const index = this.indexOf(contact)

	if (index >= 0) {
		this._contact.splice(index, 1)
		return true
	}
	return false
}

Bucket.prototype.hasContact = nodeID => {
	for (let i = 0; i < this.getSize(); i++) {
		if (this.getContact(i).nodeIF === contact.nodeID) {
			return i
		}
	}
	return -1;
}

module.exports = Bucket
