import dgram from 'dgram'
const urlParse = require('url').parse
import crypto from 'crypto'
import torrentParser from './torrent-parser'
import anon from './anonymizer'
import chalk from 'chalk'
const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))
const __tryout = 3
let __TO = ''
let __URL = ''

module.exports.getPeers = (torrent, callback) => {

	const client = dgram.createSocket('udp4')
	__URL = torrent.announce[0]
    tryoutCall(__tryout, client, buildConnReq(), torrent.announce)

    client.on('message', response => {
		clearTimeout(__TO)
        if (respType(response) === 'connect') {
            ilog(':')
            const connResp = parseConnResp(response)
            const announceReq = buildAnnounceReq(connResp.connectionId, torrent)
			tryoutCall(__tryout, client, announceReq, __URL)
        } else if (respType(response) === 'announce') {
			ylog(':')
            const announceResp = parseAnnounceResp(response)
            callback(announceResp.peers)
        }
    })

    client.on('error', e => {
        elog('!')
        log(e)
    })
}

function tryoutCall(tryout, client, message, announce) {
	blog('.')

	if (Array.isArray(announce) && (tryout === 0)) {
		tryout = __tryout
		announce.shift()
		ylog(',')
		__URL = announce[0]
	} else if (tryout === 0) {
		ylog("Server didn't respond...")
		return
	}

	if (!announce[0]) {
		throw new Error('Impossible connexion')
	}
	udpSend(client, message, __URL)
	tryout -= 1
	__TO = setTimeout(tryoutCall,
		(20000 ** (__tryout - 2)) - tryout,
		tryout,
		client,
		message,
		announce,
	);
}

function udpSend(client, message, rawURL, callback=()=>{}) {
    const url = urlParse(rawURL)
    client.send(message, 0, message.length, url.port, url.hostname, callback)
}

function respType(res) {
    const action = res.readUInt32BE(0)
    if (action === 0) return 'connect'
    if (action === 1) return 'announce'
}

function buildConnReq() {
    const buf = Buffer.alloc(16)
    buf.writeUInt32BE(0x417, 0)
    buf.writeUInt32BE(0x27101980, 4)
    buf.writeUInt32BE(0, 8)
    crypto.randomBytes(4).copy(buf, 12)

    return buf
}

function buildAnnounceReq(connId, torrent, port=6881){
    const buf = Buffer.allocUnsafe(98)
    connId.copy(buf, 0)
	buf.writeUInt32BE(1, 8)
    crypto.randomBytes(4).copy(buf, 12)
    torrent.infoHashBuffer.copy(buf, 16)
    anon.newId().copy(buf, 36)
    Buffer.alloc(8).copy(buf, 56)
    torrentParser.size(torrent).copy(buf, 64)
    Buffer.alloc(8).copy(buf, 72)
    buf.writeUInt32BE(0,80)
    buf.writeUInt32BE(0,84)
    crypto.randomBytes(4).copy(buf, 88)
    buf.writeInt32BE(-1, 92)
    buf.writeUInt16BE(port, 96)

    return buf
}

function parseConnResp(resp) {
    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        connectionId: resp.slice(8)
    }
}

function parseAnnounceResp(resp) {
    function group(iter, groupSize) {
        let groups = []
        for (let i = 0; i < iter.length; i += groupSize) {
            groups.push(iter.slice(i, i + groupSize))
        }
        return groups
    }

    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        interval: resp.readUInt32BE(8),
        leachers: resp.readUInt32BE(12),
        seeders: resp.readUInt32BE(16),
        peers: group(resp.slice(20), 6).map(address => {
            return {
                ip: address.slice(0, 4).join('.'),
                port: address.readUInt16BE(4)
            }
        })
    }
}
