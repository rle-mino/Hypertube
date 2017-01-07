/* eslint semi: ["error", "never"]*/

import dgram from 'dgram'
import crypto from 'crypto'
import torrentParser from '../download_manager/torrent-parser'
import anon from '../lib/anonymizer'
import log from '../lib/log'

const urlParse = require('url').parse

const __tryout = 3
let __TO = ''
let __URL = ''

function tryoutCall(tryout, client, message, announce) {
	clearTimeout(__TO)
	if (Array.isArray(announce) && (tryout === 0)) {
		tryout = __tryout
		announce.shift()
		__URL = announce[0]
	} else if (tryout === 0) {
		log.e("Server didn't respond...")
		return
	}

	if (!announce[0]) {
		throw new Error('Impossible connexion')
	}

	function udpSend(client, message, rawURL, callback = () => {}) {
		const url = urlParse(rawURL)
		client.send(message, 0, message.length, url.port, url.hostname, callback)
	}

	log.log(`Connection to tracker ${__URL} tryout (${4 - tryout}/3)`)
	udpSend(client, message, __URL)
	__TO = setTimeout(() => {
		tryoutCall(tryout - 1, client, message, announce)
	},
		5000)
}

function respType(res) {
    const action = res.readUInt32BE(0)
    if (action === 0) return 'connect'
    if (action === 1) return 'announce'
	return null
}

function buildConnReq() {
    const buf = Buffer.alloc(16)
    buf.writeUInt32BE(0x417, 0)
    buf.writeUInt32BE(0x27101980, 4)
    buf.writeUInt32BE(0, 8)
    crypto.randomBytes(4).copy(buf, 12)

    return buf
}

function buildAnnounceReq(connId, torrent, port = 6881) {
    const buf = Buffer.allocUnsafe(98)
    connId.copy(buf, 0)
	buf.writeUInt32BE(1, 8)
    crypto.randomBytes(4).copy(buf, 12)
    torrent.infoHashBuffer.copy(buf, 16)
    anon.newId().copy(buf, 36)
    Buffer.alloc(8).copy(buf, 56)
    torrentParser.size(torrent).copy(buf, 64)
    Buffer.alloc(8).copy(buf, 72)
    buf.writeUInt32BE(0, 80)
    buf.writeUInt32BE(0, 84)
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
        const groups = []
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

log.i('Starting bitTorrent client')

export const getPeers = function (torrent, callback) {
	const client = dgram.createSocket('udp4')
	__URL = torrent.announce[0]
    tryoutCall(__tryout, client, buildConnReq(), torrent.announce)

    client.on('message', response => {
		clearTimeout(__TO)
        if (respType(response) === 'connect') {
            const connResp = parseConnResp(response)
            const announceReq = buildAnnounceReq(connResp.connectionId, torrent)
			tryoutCall(__tryout, client, announceReq, __URL)
        } else if (respType(response) === 'announce') {
			const announceResp = parseAnnounceResp(response)
			if (announceResp.peers.length > 0) {
				callback(announceResp.peers)
			} else {
				getPeers(torrent, callback)
			}
        }
    })

    client.on('error', () => {
        log.e('!')
    })
}
