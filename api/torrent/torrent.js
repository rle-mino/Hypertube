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

// const authorizeFileTransfer = (movie) => {
//     return ({
// 		success: true,
// 		status: 'success',
// 		message: 'torrent file should be downloaded',
// 		data: {
//     "title" : "2.Broke.Girls.S06E12.HDTV.x264-LOL",
//     "year" : 2015,
//     "runtime" : 111,
//     "poster" : "https://images-na.ssl-images-amazon.com/images/M/MV5BMTA3Mzc5Nzk0ODReQTJeQWpwZ15BbWU4MDA2ODQxMTcx._V1_SX300.jpg",
//     "plot" : "A snapshot in time-the film chronicles the story behind the 1955 LIFE magazine photo thread by Dennis Stock of then-rising star, James Dean, and gives us an inside look at some of Hollywood's most iconic images and into the life of a gifted, but troubled man.",
//     "code" : "tt2948840",
//     "rating" : 6.1,
//     "pop" : 12.5,
//     "episodes" : [],
//     "torrents" : [
//         {
//             "magnet" : "magnet:?xt=urn:btih:7306674e857c3561715a9beb3510e13db25348ff&dn=Life&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://glotorrents.pw:6969/announce",
//             "date_uploaded_unix" : 1452798893,
//             "date_uploaded" : "2016-01-14 14:14:53",
//             "size_bytes" : 870234194,
//             "size" : "829.92 MB",
//             "peers" : 4,
//             "seeds" : 11,
//             "quality" : "720p",
//             "hash" : "7306674e857c3561715a9beb3510e13db25348ff",
//             "url" : "https://yts.ag/torrent/download/FCD0E4E2455203C7AD100A9BFCC9D4A52028ADD8"
//         },
//         {
//             "magnet" : "magnet:?xt=urn:btih:308D78F127E0F0ED2A38E3A87742C10FDBBA3648&dn=2.Broke.Girls.S06E12.HDTV.x264-LOL&xl=1825361101&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce",
//             "date_uploaded_unix" : 1452809070,
//             "date_uploaded" : "2016-01-14 17:04:30",
//             "size_bytes" : 1825361101,
//             "size" : "1.7 GB",
//             "peers" : 1,
//             "seeds" : 14,
//             "quality" : "1080p",
//             "hash" : "308D78F127E0F0ED2A38E3A87742C10FDBBA3648",
//             "url" : "https://yts.ag/torrent/download/EC341BBC6F228AD669C9B5397DE7904E496A5EB9"
//         }
//     ],
//     "genres" : [
//         "Action",
//         "Biography",
//         "Drama"
//     ],
//     "__v" : 0
// }})
//     try {
//         if (!!movie && true) { // should verify download conditions in database
//             return {success: true, status: 'success', message: "torrent file should be downloaded", data: movie}
//         } else return {success: false, status: 'error', message: "torrent file won't be downloaded", data: movie}
//     } catch(err) {
//         log.e('File transfer authorization error: ', err)
//     }
// }

// const torrentFromMagnet = (magnet, cb) => {
//     if (magnet) {
//         const torrent = magnetURIDecode(magnet)
//         cb(torrent)
//     }
//     return null
// }

// const torrentFromFile = (url, cb) => {
// 	try {
// 		https.get(url, res => {
// 			let rawData = Buffer.from('')
// 			res.on('data', chunk => {
// 				const chunkBuf = Buffer.from(chunk)
// 				rawData = Buffer.concat([rawData, chunkBuf], rawData.length + chunkBuf.length)
// 			}).on('error', e => {
// 				res.resume()
// 				throw e
// 			})
// 			res.on('end', () => {
//                 const torrent = bencode.decode(rawData, 'utf8')
//                 if (!torrent.announce || !(/^udp/.test(torrent.announce))) { throw new Error('improper torrent entry') }
//                 cb(torrent)
// 			})
// 		})
// 	} catch (e) {
// 		throw e
// 	}
// }

// const startDownload = torrent => {
// 	if (!KRPC) {
// 		log.e('Kadmelia RPC not loaded')
// 	}
// 	try {
// 		const torrentFile = new TorrentFile(torrent, KRPC)
// 		torrentFile.on('ready', )
// 	} catch (e) {
// 		console.log(e)
// 	}
// }

// const torrentBis = (movie, req, next) => {
//     // this downloads the movie to fs and updates database
// 	// then next() is called to start streaming process. next() call should
// 	// happen when streaming process an be started
//     // AND EXECUTED IN FULL without the need for some more buffering.
//
//     try {
//         const torrents = movie.torrents
//         return selectTorrent(torrents)
//         if (file.torrent.magnet) {
//             torrentFromMagnet(file.torrent.magnet, startDownload)
//         } else {
//             torrentFromFile(file.torrent.url, startDownload)
//         }
//     } catch (e) {
//         log.e(`Torrent API master error: ${e}`)
//     }
// }

const torrent = (req, res, next) => {
	console.log(req.params.id, req.query.s, req.query.e)
	// server = new Server({ IP: '127.0.0.1', TCPPort: 6881 })
	if (!KRPC) {
		res.send({
			status: 'error',
			message: 'Torrent client not loaded yet',
		})
	} else {
		const torrent = selectTorrent(req)
		if (torrent.status && torrent.status === 'error') {
			res.send({
				status: 'error',
				message: 'Torrent not found in database for selected resolution',
			})
			res.end()
			return
		}
		res.writeHead(200, { 'Content-Type': 'video/mp4' })
		if (torrent.path) {
			req.query.path = torrent.path
			next()
		} else {
			const file = new TorrentFile(torrent, KRPC)
			file.on('ready', path => {
				req.query.path = path
				next()
			})
		}
	}
}

const selectTorrent = (req) => {
	const torrents = returnData(req).result
	console.log('Torrents', torrents)
    let selected = []
    for (let i = _validResolution.indexOf(_preferredResolution);
	(selected.length === 0 && i < _validResolution.length);
	i += 1) {
        selected = torrents.filter(e => (e.quality === _validResolution[i]))
	}
    if (selected.length > 0) {
		const torrent = selected[0]
		torrent.infoHash = torrent.hash
		return torrent
	}
	log.e('error')
	return { status: 'error' }
}

export default torrent
