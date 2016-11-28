module.exports = krpc
import dgram from 'dgram'
import crypto from 'crypto'
import anon from '../anonymizer'
import bencode from 'bencode'

const krpc = {
	ip: '',
	port:0,
	client: dgram.createSocket('udp4'),
	udpSend: (client, message, port, ip, callback=()=>{}) =>{
	    const url = urlParse(rawURL)
	    client.send(message, 0, message.length, url.port, url.hostname, callback)
	},
	PING: {},
	STORE:{},
	FIND_NODE:(ip, port, id){
		let buf = Buffer.alloc(160)
		id.copy(buf, 0)
		this.udpSend(this.client, buf, this.port, this.ip)
		// should make request to get <IP, UDP Port, NodeID> answer
	},
	FIND_VALUE:{}
}

function encodeNodeContact(contact){
	if (!contact || !contact.ip || !contact.port || (contact.id.length !== 20)) throw new Error('incomplete information for DHT contact')
	let buf = Buffer.alloc(26)
	contact.id.copy(buf, 0)
	let ip = contact.ip.split('.')
	for (let i = 0; i < 4; i++) {
		buf.writeUInt8(ip[i], i + 20)
	}
	buf.writeUInt16(contact.port, 24)
	return buf
}
function encodeQuery(query) {
	if (!query || !query.id) throw new Error('incomplete information for DHT query')
}
