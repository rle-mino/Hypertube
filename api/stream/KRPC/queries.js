import anon from '../anonymizer'
const y = 'q'
// and q as method value string
// and a as arguments

function BuildPingQuery(){
	let message = {
		t	: anon.newKrpcId(),
		y,
		q	: 'ping',
		a	: {id: anon.nodeId()}
	}
	return Buffer.from(bencode.encode(message))
}

function BuildFindNodeQuery(querying, target) {
	let message = {
		t	: anon.newKrpcId(),
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
