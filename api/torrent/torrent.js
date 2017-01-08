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
import bencode			from 'bencode'
import https			from 'https'

import stream			from '../stream/stream'
import TorrentFile		from './Torrentfile'
import magnetURIDecode	from './magnet-parser'
import RPC				from './KRPC/rpc'
import * as tracker		from './tracker/tracker'
import log				from './lib/log'
// import Server			from './download_manager/Server'
import { returnData }	from '../movie/info'

// inherits(torrent, EventEmitter)

const torrentAmorce = {
	size: 1825361101,
	infoHash: '308D78F127E0F0ED2A38E3A87742C10FDBBA3648',
	infoHashBuffer: Buffer.from('308D78F127E0F0ED2A38E3A87742C10FDBBA3648', 'hex'),
	announce: [
	'udp://p4p.arenabg.ch:1337',
	'udp://tracker.leechers-paradise.org:6969',
	'udp://tracker.coppersurfer.tk:6969',
	'udp://tracker.openbittorrent.com:80',
	'udp://torrent.gresille.org:80/announce',
	'udp://tracker.opentrackr.org:1337/announce',
	'udp://glotorrents.pw:6969/announce'],
}

let KRPC = null
setTimeout(() => {
	tracker.getPeers(torrentAmorce, peers => {
		// console.log('Running in safe mode')
		KRPC = new RPC({ peers, port: 6881 })
	})
}, 300)
// let server = {}
const _validResolution = [
    '8k',
    '2160p',
    '4k',
    '1440p',
    '1080p',
    '720p',
    '420p',
]

const _preferredResolution = '8k'

const torrent = async (req, res, next) => {
	// server = new Server({ IP: '127.0.0.1', TCPPort: 6881 })
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
		if (_torrent.path) {
			req.query.path = _torrent.path
			next()
		} else {
			const file = new TorrentFile(_torrent, KRPC)
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
	if (ret.status === 'error') return { status: 'error' }
	const torrents = ret.result.torrents
    let selected = []
    for (let i = _validResolution.indexOf(_preferredResolution);
	(selected.length === 0 && i < _validResolution.length);
	i += 1) {
        selected = torrents.filter(e => (e.quality === _validResolution[i]))
	}
    if (selected.length > 0) {
		const torrent = selected[0]
		torrent.infoHash = torrent.hash.toLowerCase()
		torrent.infoHashBuffer = Buffer.from(torrent.infoHash, 'hex')
		return torrent
	}
	log.e('error !')
	return { status: 'error' }
}

export default torrent
