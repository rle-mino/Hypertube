import merge from 'merge'
import {KRPC, KRPCMessage} from '../KRPC/krpc'

module.exports = function buildProtocol(protocolSpec) {
	if (!(typeof protocolSpec === 'object')) throw new Error('Invalid protocol specification')

	return function protocol(message, contact, next){
		let rpc = this
		if (KRPC.isResponse(message)) {
			return next()
		}

		let method = protocolSpec[message.method]

		if (typeof method !== 'function') {
			return next()
		}

		method.call(rpc, message.params, (err, result) => {
			let reply = new KRPCMessage({
				error: err,
				result: merge({ contact: rpc._contact }, result),
				id: message.id
			})

			rpc.send(contact, reply)
		})
	}
}
