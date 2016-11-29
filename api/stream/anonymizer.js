import crypto from 'crypto'
import axios from 'axios'
import chalk from 'chalk'

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))

let id			= null,
	_nodeId		= ''
const random	= 'IlnefautjamaisjugerlesgenssurleursfrequentationsTenezJudasparexempleilavaitdesamisirreprochables'

let anon = {
	_nodeId		: '',
    newId		: () => {
        if (!id) {
            id = crypto.randomBytes(20)
            Buffer.from('-HT0001-').copy(id, 0)
        }
        return id
    },

	newKrpcId	: () => {
		const index = Math.floor(Math.random() * (random.length - 2))
		const id = random.slice(index, index + 2)
		return id
	},

	nodeId		: () =>{
		try {
			if (!anon._nodeId || anon._nodeId === '') {
				anon._nodeId = anon.newId()
			}
		} catch(e) {
			throw e
		}
		return anon._nodeId
	},

	contact		: async (_port) => {

		try {
			let res	= await axios.get('https://api.ipify.org?format=json')
			let buf	= Buffer.alloc(6)
			if (res.data && res.data.ip) {
				const ip = res.data.ip
				const port = _port || 6881
				let ipInts = ip.slice('.')
				for (let i = 0; i < 4; i++){
					buf[i] = parseInt(ipInts[i], 10)
				}
				buf.writeUInt16BE(port, 4)
				return buf
			} else {
				throw new Error('No IP')
				return
			}
		} catch(e) {
			throw e
		}
	},

	nodeContact	: async (_port) => {
		try {
			let contact = await anon.contact(_port)
			let id = anon.newId()
			let buf	= Buffer.alloc(26)
			id.copy(buf, 0)
			contact.copy(buf, 20)
			return buf
		} catch(e) {
			throw e
		}
	}
}

module.exports = anon
