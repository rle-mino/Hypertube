import dgram from 'dgram'
import crypto from 'crypto'
import anon from '../lib/anonymizer'
import bencode from 'bencode'
import hat from 'hat'
import merge from 'merge'

const B = 160

function KRPCMessage(spec) {
	if (!(this instanceof Message)) {
		return new Message(spec)
	}
	this.jsonrpc = '2.0'

	if (KRPCMessage.isRequest(spec)) {
		this.id = spec.id || Message.createID()
		this.method = spec.method
		this.params = spec.params
	} else if (KRPCMessage.isResponse(spec)) {
		this.is = spec.id
		this.result = merge({}, spec.result)
		if (spec.error) {
			this.error = {
				code	: -32603,
				message	: spec.error.message
			}
		}
	} else {
		throw new Error('Invalid message specification')
	}
}

KRPCMessage.prototype.serialize = () => {
	return Buffer.from(JSON.stringify(this), 'utf8')
}

KRPCMessage.isRequested = parsed => {
	return !!(parsed.method && parsed.params)
}

KRPCMessage.isResponse = parsed => {
	return !!(parsed.id && (parsed.result || parsed.error))
}

KRPCMessage.fromBuffer = buffer => {
	function _convertByteArrays(key, value) {
		return value && value.type === 'Buffer' ? Buffer.from(value.data) : value
	}

	let parsed = JSON.parse(buffer.toString('utf8'), _convertByteArrays)
	let message = new KRPCMessage(parsed)

	return message
}

KRPCMessage.createID = () => {
	return hat.rack(B)()
}

module.exports = KRPCMessage
