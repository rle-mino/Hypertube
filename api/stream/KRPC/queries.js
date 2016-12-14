/* eslint semi: ["error", "never"]*/
import bencode from 'bencode'
import anon from '../anonymizer'

const y = 'q'
// and q as method value string
// and a as arguments

export function BuildPingQuery(t, _port) {
	const port = _port || null
	const message	= {
		t,
		y,
		q: 'ping',
		a: {
			id: anon.nodeId(port),
		},
	}
	return Buffer.from(bencode.encode(message))
}

export function BuildFindNodeQuery(t, target, _port) {
	const message = {
		t,
		y,
		q: 'find_node',
		a: {
			id: anon.nodeId(_port),
			target,
		},
	}
	return Buffer.from(bencode.encode(message))
}

export function BuildGetPeersQuery(t, infoHash, noseed, scrape) {
	const message = {
		t,
		y,
		q: 'get_peers',
		a: {
			id: anon.nodeId(),
			info_hash: infoHash,
		},
	}
	if (noseed) message.a.noseed = 1
	if (scrape) message.a.scrape = 1

	return Buffer.from(bencode.encode(message))
}

export function BuildAnnouncePeer(port, infoHash, token) {
	const message = {
		t: anon.newKrpcId(),
		y,
		q: 'announce_peer',
		a: {
			implied_port: 1,
			info_hash: infoHash,
			port: port || 0,
			token,
		},
	}
	return bencode.encode(message)
}
