/* eslint semi: ["error", "never"]*/

import net from 'net'
import log from './lib/log'

function Server (client) {
	if (!(this instanceof Server)) return new Server(client)
	const self = this
	this.port = client.TCPPort
	this.ip = client.IP
	this.server = net.createServer()
	this.server.listen(this.port, this.ip)
	this.server.on('error', self.onError)
	this.server.on('connection', self.onConnection)
	this.server.on('listening', log.l('Torrent client listening on', self.server.address()))
}

Server.prototype.onError = function (e) {
	if (e.code === 'EADDRINUSE') {
		log.i('Address in use, retrying...')
		setTimeout(() => {
			this.server.close()
			this.port = this.port >= 65000 ? 6881 : this.port + 1
			this.server.listen(this.port, this.ip)
		}, 1000)
	}
}

Server.prototype.onConnection = function (socket) {
	return null
}

export default Server
