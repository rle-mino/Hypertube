import anon from '../anonymizer'
const y = 'q'
import bencode from 'bencode'
// and q as method value string
// and a as arguments

export async function BuildPingQuery(t, _port) {
	const port = _port || null
	try {
		let id = await anon.nodeId(port)
		let message = {
			t,
			y,
			q	: 'ping',
			a	: {id}
		}
		return Buffer.from(bencode.encode(message))
	} catch(e){
		throw e
	}
}

function BuildFindNodeQuery(querying, target) {
	let message = {
		t,
		y,
		q	: 'find_nodes',
		a	: {
			id		: anon.nodeId(),
			target	: target
		}
	}
	return Buffer.from(bencode.encode(message))
}

function BuildGetPeers(querying, infoHash, noseed, scrape) {
	let message = {
		t	: anon.newKrpcId(),
		y,
		q	: 'get_peers',
		a	: {
			id				: querying,
			info_hash		: infoHash
		}
	}
	if (noseed) message.a.noseed = 1
	if (scrape) message.a.scrape = 1

	return bencode.encode(message)
}

function BuildAnnouncePeer(contact, infoHash, token) {
	if (!contact || !contact.port) { throw new Error('Contact informations incomplete')}
	let message = {
		t	: anon.newKrpcId(),
		y,
		q	: 'announce_peer',
		a	: {
			implied_port	: 1,
			info_hash		: infoHash,
			port			: contact.port,
			token			: token
		}
	}
	if (!contact.implied_port) message.a.implied_port = 0
	if (contact.seending.indexOf(infoHash) !== -1) message.a.seed = 1

return bencode.encode(message)
}
