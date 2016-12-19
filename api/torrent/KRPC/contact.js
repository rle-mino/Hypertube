/* eslint semi: ["error", "never"]*/
import { EventEmitter } from 'events'
import inherits from 'inherits'

const B = 160

function Contact(opts) {
	if (!(this instanceof Contact)) return new Contact(opts)

	this.nodeId = opts.nodes || null
	this.ip = opts.ip
	this.port = opts.port

	if (!this.nodeId || this.nodeId.length !== B / 8) return null
	this.seen()
}

inherits(Contact, EventEmitter)

Contact.prototype.seen = function () {
	this.lastSeen = Date.now()
}

Contact.prototype.valid = function () {
	return true
}

module.exports = Contact
