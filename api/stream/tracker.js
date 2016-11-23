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

module.exports.getPeers = (torrent, callback) => {
    const client = dgram.createSocket('udp4')
    const url = torrent.announce.toString('utf8')

    blog('.')
    udpSend(client, buildConnReq(), url)

    client.on('message', response => {
        if (respType(response) === 'connect') {
            ilog('.')
            const connResp = parseConnResp(response)
            const announceReq = buildAnnounceReq(connResp.connectionId)
            udpSend(client, announceReq, url)
        } else if (respType(response) === 'announce') {
            const announceResp = parseAnnounceResp(response)
            callback(announceResp.peers)
            ylog('.')
        }
    })

    client.on('error', e => {
        elog('.')
        log(e)
    })
}

function udpSend(client, message, rawURL, callback=()=>{}) {
    const url = urlParse('udp://tracker.opentrackr.org:1337/announce')
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
