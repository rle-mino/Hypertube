import chalk from 'chalk'
import LRU from 'lru'
import anon from './anonymizer'
import Contact from './contact'
import {EventEmitter} from 'events'
import inherits from 'inherits'
import bencode from 'bencode'
import crypto from 'crypto'
import _ from 'lodash'
import anon from './anonymizer'

const B = 160

function Contact(opts) {
	if (!(this instanceof Contact)) return new Contact(opts)

	if (!(opts instanceof Object)) throw new Error('Invalid contact options')

	Object.defineProperty(this, 'nodeID', {
		value: options.nodeID || this._createNodeID(),
		configurable: false,
		enumerable: true
	})

	if (!this.nodeID || this.nodeID.length !== B/4) throw new Error('Invalid nodeID')

	this.seen()
}

Contact.prototype.seen = () => {
	this.lasteSeen = Date.now()
}

Contact.prototype.valid = () => {
	return true
}

Contact.prototype._createNodeID = () => {
	anon.nodeId()
}

module.exports = Contact
