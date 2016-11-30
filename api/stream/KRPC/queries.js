import anon from '../anonymizer'
import bencode from 'bencode'
import chalk from 'chalk'

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))

const y = 'q'
// and q as method value string
// and a as arguments

export function BuildPingQuery(t, _port) {
	const port = _port || null
	let message	= {
		t,
		y,
		q		: 'ping',
		a		: {
			id		: anon.nodeId(port)
		}
	}
	return Buffer.from(bencode.encode(message))
}

export function BuildFindNodeQuery(t, target, _port) {
	let message = {
		t,
		y,
		q	: 'find_nodes',
		a	: {
			id	: anon.nodeId(_port),
			target
		}
	}
	return Buffer.from(bencode.encode(message))
}

function BuildGetPeers(t, infoHash, noseed, scrape) {
	let message = {
		t,
		y,
		q	: 'get_peers',
		a	: {
			id				: anon.nodeId(_port),
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
