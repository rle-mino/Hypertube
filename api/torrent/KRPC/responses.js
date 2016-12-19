/* eslint semi: ["error", "never"]*/
import bencode from 'bencode'
import anon from '../lib/anonymizer'

const y = 'r'
// and r as returned values


function decodeMessage(rawMessage) {
	const message = rawMessage.toStrng('binary')
	const code = {
		201: 'Generic Error',
		202: 'Server Error',
		203: 'Protocol Error',
		204: 'Method Unknown'
	}
	const payload = bencode.decode(message)
	if (payload.t && payload.y) {
		const output = {}
		output.id = payload.t
		output.type = payload.y
		if (output.type === 'q') {
			output.method = payload.q
			output.arguments = payload.a
		}
		if (output.type === 'r') {
			output.response = payload.r
		}
		if (output.type === 'e') {
			output.error = payload.e
		}
	}
}

function BuildPingResponse(t) {
	const message = {
		t,
		y,
		r: {
			id: anon.nodeId(),
		},

	}
	return bencode.encode(message)
}

function BuildFindNodeResponse(t, nodes) {
	const message = {
		t,
		y,
		r: {
			id: anon.nodeId(),
			nodes,
		},
	}
	return bencode.encode(message)
}

function BuildGetPeersResponse(t, token, values, nodes, scrape) {
	const message = {
		t,
		y,
		r: {
			id: anon.nodeId(),
			token,
		},
	}
	if (values && Array.isArray(values)) {
		message.r.values = values
	} else if (nodes) {
		message.r.nodes = nodes
	} else if (scrape) {
		message.r.BFsd = scrape.BFsd
		message.r.BFpe = scrape.BFpe
	} else {
		throw new Error('No Peer found')
	}
}

function BuildAnnouncePeerResponse(t) {
	const message = {
		t,
		y,
		r: {
			id: anon.nodeId(),
		},
	}
	return bencode.encode(message)
}
