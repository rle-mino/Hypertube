import { EventEmitter } from 'events'
import inherits from 'inherits'
import chalk from 'chalk'

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))

const B = 160

function Contact(opts) {
	if (!(this instanceof Contact)) return new Contact(opts)

	this.nodeId = opts.nodes || this._createNodeID()
	this.ip = opts.ip
	this.port = opts.port

	if (!this.nodeId || this.nodeId.length !== B / 8) throw new Error(`Invalid nodeId: ${this.nodeId.length} bytes`)
	this.seen()
}

inherits(Contact, EventEmitter)

Contact.prototype.seen = function () {
	this.lastSeen = Date.now()
}

Contact.prototype.valid = function () {
	return true
}

Contact.prototype._createNodeID = function () {
	elog('ERROR')
}

module.exports = Contact
