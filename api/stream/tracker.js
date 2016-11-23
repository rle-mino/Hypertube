import dgram from 'dgram'
const urlParse = require('url').parse(
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
)

function udpSend(client, message, rawURL, callback = () => {}) {
    const url = urlParse(rawURL)
    client.send(message, 0, message.length, url.port, url.host, callback)
}

function respType(res) {

}

function buildConnReq() {

}

function buildAnnounceReq(connId){

}

function parseConnResp(resp) {

}

function parseAnnounceResp(resp) {

}
