/* eslint semi: ["error", "never"]*/

import net from 'net'
import log from '../lib/log'

function Server(client) {
	if (!(this instanceof Server)) return new Server(client)
	const self = this
	this.port = client.TCPPort
	this.ip = client.IP
	this.wire = []
	this.server = net.createServer()
	this.server.listen(this.port, this.ip)
	this.server.on('error', self.onError)
	this.server.on('connection', self.onConnection)
	this.server.on('listening', () => console.log('Torrent server listening on', self.server.address()))
}

Server.prototype.onError = function (e) {
	const self = this
	if (e.code === 'EADDRINUSE') {
		log.i('Address in use, retrying...')
		setTimeout(() => {
			self.server.close()
			self.port = self.port >= 65000 ? 6881 : self.port + 1
			self.server.listen(self.port, self.ip)
		}, 1000)
	}
}

Server.prototype.addWire = function (wire) {
	console.log('new incoming connection')
	this.wire.push(wire)
}

Server.prototype.onConnection = function (socket) {
	this.wire.forEach(w => w.incomingConnection(socket))
}

Server.prototype.getPort = function () {
	return this.server.address().port
}

export default Server
