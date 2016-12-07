/* eslint semi: ["error", "never"]*/

import crypto from 'crypto'
import axios from 'axios'


let id			= null

const random	= 'IlnefautjamaisjugerlesgenssurleursfrequentationsTenezJudasparexempleilavaitdesamisirreprochables'

const anon = {
	_nodeId: '',
    newId: () => {
        if (!id) {
            id = crypto.randomBytes(20)
            Buffer.from('-HT0001-').copy(id, 0)
        }
        return id
    },

	newKrpcId: () => {
		const index = Math.floor(Math.random() * (random.length - 2))
		return random.slice(index, index + 2)
	},

	nodeId: () => {
		if (!anon._nodeId || anon._nodeId === '') {
			anon._nodeId = crypto.randomBytes(20)
            // Buffer.from('-HT0001-').copy(id, 0)
		}
		return anon._nodeId
	},

	contact: async (_port) => {
		try {
			const res	= await axios.get('https://api.ipify.org?format=json')
			const buf	= Buffer.alloc(6)
			if (res.data && res.data.ip) {
				const ip = res.data.ip
				const port = _port || 6881
				const ipInts = ip.slice('.')
				for (let i = 0; i < 4; i += 1) {
					buf[i] = parseInt(ipInts[i], 10)
				}
				buf.writeUInt16BE(port, 4)
				return buf
			}
			throw new Error('No IP')
		} catch (e) {
			throw e
		}
	},

	nodeContact: async (_port) => {
		try {
			const contact = await anon.contact(_port)
			const _id = anon.newId()
			const buf	= Buffer.alloc(26)
			_id.copy(buf, 0)
			contact.copy(buf, 20)
			return buf
		} catch (e) {
			throw e
		}
	},
}

module.exports = anon
