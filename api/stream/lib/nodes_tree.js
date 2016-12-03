import Bucket from '../bucket'

module.exports = NodeTree

function NodeTree (zero, one) {
	if (!(this instanceof NodeTree)) return new NodeTree(zero, one)
	if (!(zero instanceof NodeTree) && !(zero instanceof Bucket)) {
		throw new Error('Incompatible pointer type for NodeTree')
	}
	this.one = one
	this.zero = zero
	setInterval(() => {console.log('NODE details: ', this.one, this.zero)}, 1000)
}

NodeTree.prototype.isEmpty = function() {
	return (this.one.isEmpty() && this.zero.isEmpty())
}

NodeTree.prototype.addContact = function(contact, bits) {
	if (!bits) throw new Error('missing argument bits')
	const bit = bits.pop()
	if (!bit) {
		return this.zero.addContact(contact, bits)
	} else {
		return this.one.addContact(contact, bits)
	}
}

NodeTree.prototype.isFull = function(bits) {
	if (!bits) throw new Error('missing argument bits')
	const bit = bits.pop()
	if (!bit) {
		return this.zero.isFull(bits)
	} else {
		return this.one.isFull(bits)
	}
}

NodeTree.prototype.getOne = function() {
	return this.one
}

NodeTree.prototype.getZero = function() {
	return this.zero
}

NodeTree.prototype.halve = function (bits) {
	if (!bits) throw new Error('missing argument bits')
	try {
		const bit = bits.pop()
		if (!bit) {
			if (this.zero instanceof Bucket){
				const tmp = this.zero.halve(bits)
				this.zero = new NodeTree(tmp[0], tmp[1])
			} else {
				return this.zero.halve(bits)
			}
		} else {
			if (this.one instanceof Bucket){
				const tmp = this.one.halve(bits)
				this.zero = new NodeTree(tmp[0], tmp[1])
			} else {
				return this.zero.halve(bits)
			}
		}
	} catch(e){
		console.log('node tree: ' + e.message)
	}
}
