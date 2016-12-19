import chalk from 'chalk'
import Bucket from '../KRPC/bucket'

const log = m => console.log(chalk.blue(m))
const mlog = m => process.stdout.write(chalk.magenta(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))


function NodeTree(zero, one) {
	if (!(this instanceof NodeTree)) return new NodeTree(zero, one)
	if (!(zero instanceof NodeTree) && !(zero instanceof Bucket)) {
		throw new Error('Incompatible pointer type for NodeTree')
	}
	this.zero = zero
	this.one = one
}

NodeTree.prototype.isEmpty = function() {
	return (this.one.isEmpty() && this.zero.isEmpty())
}

NodeTree.prototype.isGood = function (contact, nodeId) {
	try {
		if (!contact) throw new Error('missing argument contact')
		if (!nodeId) throw new Error('missing argument nodeId')
		const bit1	= contact.shift()
		const bit2	= nodeId.shift()
		if (!bit1 && !bit2) {
			return this.zero.isGood(contact, nodeId)
		} else if (bit1 && bit2) {
			return this.one.isGood(contact, nodeId)
		}
		return false
	} catch (e) {
		throw e
	}
}

NodeTree.prototype.addContact = function (contact, bits) {
	if (!bits) throw new Error('missing argument bits')
	const bit = bits.shift()
	if (!bit) {
		return this.zero.addContact(contact, bits)
	}
	return this.one.addContact(contact, bits)
}

NodeTree.prototype.getContactList = function (hash) {
	if (!hash) {
		throw new Error('missing argument hash')
		elog('!!!')
	}
	const bit = hash.shift()
	if (!bit) {
		return this.zero.getContactList(hash)
	}
	return this.one.getContactList(hash)
}

NodeTree.prototype.isFull = function (bits) {
	if (!bits) throw new Error('missing argument bits')
	const bit = bits.shift()
	if (!bit) {
		return this.zero.isFull(bits)
	}
	return this.one.isFull(bits)
}

NodeTree.prototype.getOne = function () {
	return this.one
}

NodeTree.prototype.getZero = function () {
	return this.zero
}

NodeTree.prototype.halve = function (bits) {
	if (!bits) throw new Error('missing argument bits')
	try {
		const bit = bits.shift()
		if (!bit) {
			if (this.zero instanceof Bucket) {
				const tmp = this.zero.halve(bits)
				this.zero = new NodeTree(tmp[0], tmp[1])
			} else {
				return this.zero.halve(bits)
			}
		} else {
			if (this.one instanceof Bucket) {
				const tmp = this.one.halve(bits)
				this.one = new NodeTree(tmp[0], tmp[1])
			} else {
				return this.one.halve(bits)
			}
		}
	} catch (e) {
		throw e
	}
}

module.exports = NodeTree
