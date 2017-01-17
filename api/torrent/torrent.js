/* eslint semi: ["error", "never"]*/
/* torrent.js validates a movie identified in the request and downloads it if
*  its status is not downloaded. If
*  downloaded or when enough downloaded for being played, outputed
*  video+audio+cc files are encrypted into HTML 5
*  compliant video format:
*  <video>: VP8 and Vorbis in WebM
*  <video>: VP9 and Opus in WebM
*  <video>: Streaming WebM via MSE
*  <video>: Theora and Vorbis in Ogg
*  <video>: H.264 and MP3 in MP4
*  <video>: H.264 and AAC in MP4 <============ PREFERABLY
*  <video>: FLAC in MP4
*/

import TorrentFile		from './Torrentfile'
import RPC				from './KRPC/rpc'
import * as tracker		from './tracker/tracker'
import log				from './lib/log'
import Server			from './download_manager/Server'
import { returnData }	from '../movie/info'
import { addPath }		from '../movie/scrap'

// inherits(torrent, EventEmitter)

const torrentAmorce = {
	size: 1825361101,
	infoHash: '1581F09B4A26C3615F72B3B932627F5B8D6DD9F0'.toLowerCase(),
	infoHashBuffer: Buffer.from('1581F09B4A26C3615F72B3B932627F5B8D6DD9F0', 'hex'),
	announce: [
	'udp://tracker.leechers-paradise.org:6969',
	'udp://tracker.coppersurfer.tk:6969',
	'udp://tracker.openbittorrent.com:80',
	'udp://torrent.gresille.org:80/announce',
	'udp://tracker.opentrackr.org:1337/announce'],
}

let KRPC = null
setTimeout(() => {
	tracker.getPeers(torrentAmorce, peers => {
		// console.log('Running in safe mode')
		KRPC = new RPC({ peers, port: 6881 })
	})
}, 300)

const server = new Server({ IP: '127.0.0.1', TCPPort: 6881 })

const _validResolution = [
    '8k',
    '2160p',
    '4k',
    '1440p',
    '1080p',
    '720p',
	'480p',
    '420p',
]

const _preferredResolution = '8k'

const torrent = async (req, res, next) => {
	if (!KRPC) {
		res.send({
			status: 'error',
			message: 'Torrent client not loaded yet',
		})
	} else {
		let _torrent = null
		try {
			_torrent = await selectTorrent(req)
		} catch (e) {
			console.log(e)
		}
		if (_torrent.status && _torrent.status === 'error') {
			res.send({
				status: 'error',
				message: 'Torrent not found in database for selected'
				+ ' resolution',
			})
			res.end()
			return
		}
		res.writeHead(200, { 'Content-Type': 'video/mp4' })
		req.query.q = _torrent.quality
		req.query.size = _torrent.size_bytes
		if (_torrent.path) {
			req.query.path = _torrent.path
			addPath(req)
			next()
		} else {
			log.i('download new movie')
			const file = new TorrentFile(_torrent, KRPC, server)
			file.once('ready', path => {
				console.log('Now playing', path)
				req.query.path = path
				next()
			})
		}
	}
}

const selectTorrent = async (req) => {
	let ret = null
	try {
		ret = await returnData(req)
	} catch (e) {
		console.log(e)
	}
	if (!ret || ret.status === 'error') return { status: 'error' }
	const torrents = ret.result.torrents
    let selected = []
	let q = req.query.r
	if (!_validResolution.indexOf[q] || _validResolution.indexOf[q] === -1) q = _preferredResolution
    for (let i = _validResolution.indexOf(q);
	(selected.length === 0 && i < _validResolution.length);
	i += 1) {
        selected = torrents.filter(e => (e.quality === _validResolution[i]))
	}
	if (selected.length > 0) {
		const ret0123 = selected[0]
		if (ret0123.hash.length === 40) {
			ret0123.infoHash = ret0123.hash.toLowerCase()
		} else if (ret0123.hash.length === 32) {
			ret0123.infoHash = Buffer.from(ret0123.hash, 'binary').toString('hex')
		}
		ret0123.infoHashBuffer = Buffer.from(ret0123.infoHash, 'hex')
		return ret0123
	}
	log.e('error !')
	return { status: 'error' }
}

export default torrent
