import crypto from 'crypto'
import axios from 'axios'

let id = null
const random = 'IlnefautjamaisjugerlesgenssurleursfrequentationsTenezJudasparexempleilavaitdesamisirreprochables'

let anon = {
    newId: () => {
        if (!id) {
            id = crypto.randomBytes(20)
            Buffer.from('-HyperTube0001-').copy(id, 0)
        }
        return id
    },

	_nodeId: '',

	newKrpcId: () => {
		const id = random.slice(Math.floor(Math.random() * random.length - 2))
		return Buffer.from(id)
	},

	nodeId: () =>{
		if (!this._nodeId || this._nodeId === '') {
			this._nodeId = newId()
		}
		return this._nodeId
	},

	nodeContact: async (_port)=> {
		let res	= await axios.get('https://api.ipify.org?format=json')
		let buf	= Buffer.alloc(26)
		this.nodeID().copy(buf, 0)
		if (res.data.ip) {
			const id = res.data.ip
			const port = _port || 6881
			let ipInts = ip.slice('.')
			for (i = 0; i < 4; i++){
				buf.writeUInt32BE(ipInts[i], 20 + i)
			}
			buf.writeUInt8(port, 24)
		} else {
			throw new Error('No IP')
			return
		}

	}
}

module.exports = anon
