import dgram from 'dgram'
const urlParse = require('url').parse
import crypto from 'crypto'
import torrentParser from './torrent-parser'
import anon from './anonymizer'

module.exports.getPeers = (torrent, callback) => {
    const client = dgram.createSocket('udp4')
    const url = torrent.announce.toString('utf8')

    udpSend(client, buildConnReq(), url)

    client.on('message', response => {
        if (respType(response) === 'connect') {
            const connResp = parseConnResp(response)
            const announceReq = buildAnnounceReq(connResp.connectionId)
            udpSend(client, announceReq, url)
        } else if (respType(response) === 'announce') {
            const announceResp = parseAnnounceResp(response)
            callback(announceResp.peers)
        }
    })
}

function udpSend(client, message, rawURL, callback = () => {}) {
    const url = urlParse(rawURL)
    client.send(message, 0, message.length, url.port, url.host, callback)
}

function respType(res) {

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
    crypto.randomBytes(4).copy(buf, 12)
    torrentParser.infoHash(torrent).copy(buf, 16)
    anon.newId().copy(buf, 36)
    Buffer.alloc(8).copy(buf, 56)
    torrentParser.size(torrent).copy(buf, 64)
    Buffer.alloc(8).copy(buf, 72)
    buf.writeUInt32BE(0,80)
    buf.writeUInt32BE(0,84)
    crypto.randomBytes(4).copy(buf, 88)
    buf.writeInt32BE(-1, 92)
    buf.writeUInt32BE(port, 96)

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
        let group = []
        for (let i = 0; i < iter.length; i += groupSize) {
            groups.push(iterable.slice(1, 1 + groupSize))
        }
        return groupSize
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
