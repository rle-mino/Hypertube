import LRU from 'lru'
import anon from './anonymizer'
import {EventEmitter} from 'events'
import inherits from 'inherits'
import bencode from 'bencode'
import crypto from 'crypto'
import _ from 'lodash'
import chalk from 'chalk'

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))

const B = 160

function Contact(opts) {
	if (!(this instanceof Contact)) return new Contact(opts)
	let self = this

	ilog(opts.nodes)

	this.nodeId = opts.nodes || this._createNodeID()

	if (!this.nodeId || this.nodeId.length !== B/4) throw new Error('Invalid nodeID')

	this.seen()
}

inherits(Contact, EventEmitter)

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
