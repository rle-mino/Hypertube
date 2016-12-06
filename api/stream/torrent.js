// torrent.js validates a movie identified in the request and downloads it if
// its status is not downloaded. If
// downloaded or when enough downloaded for being played, outputed
// video+audio+cc files are encrypted into HTML 5
// compliant video format:
// <video>: VP8 and Vorbis in WebM
// <video>: VP9 and Opus in WebM
// <video>: Streaming WebM via MSE
// <video>: Theora and Vorbis in Ogg
// <video>: H.264 and MP3 in MP4
// <video>: H.264 and AAC in MP4 <============ PREFERABLY
// <video>: FLAC in MP4

import bencode from 'bencode'
import chalk from 'chalk'
import https from 'https'
import TorrentFile from './Torrentfile'
import magnetURIDecode from './magnet-parser'

// inherits(torrent, EventEmitter)

const log = m => console.log(chalk.blue(m))

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

const torrentRoute = async (req, res, next) => {
	const movie = authorizeFileTransfer(req.params.movie || {}) // is movie the parameter's name?
    if (movie.success) {
        await torrent(movie.data, next)
    } else {
        next()
    }
}

const authorizeFileTransfer = (movie) => {
    return ({success: true, status: 'success', message: "torrent file should be downloaded", data: {
    "title" : "Life",
    "year" : 2015,
    "runtime" : 111,
    "poster" : "https://images-na.ssl-images-amazon.com/images/M/MV5BMTA3Mzc5Nzk0ODReQTJeQWpwZ15BbWU4MDA2ODQxMTcx._V1_SX300.jpg",
    "plot" : "A snapshot in time-the film chronicles the story behind the 1955 LIFE magazine photo thread by Dennis Stock of then-rising star, James Dean, and gives us an inside look at some of Hollywood's most iconic images and into the life of a gifted, but troubled man.",
    "code" : "tt2948840",
    "rating" : 6.1,
    "pop" : 12.5,
    "episodes" : [],
    "torrents" : [
        {
            "magnet" : "magnet:?xt=urn:btih:FCD0E4E2455203C7AD100A9BFCC9D4A52028ADD8&dn=Life&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://glotorrents.pw:6969/announce",
            "date_uploaded_unix" : 1452798893,
            "date_uploaded" : "2016-01-14 14:14:53",
            "size_bytes" : 870234194,
            "size" : "829.92 MB",
            "peers" : 4,
            "seeds" : 11,
            "quality" : "720p",
            "hash" : "FCD0E4E2455203C7AD100A9BFCC9D4A52028ADD8",
            "url" : "https://yts.ag/torrent/download/FCD0E4E2455203C7AD100A9BFCC9D4A52028ADD8"
        },
        {
            "magnet" : "magnet:?xt=urn:btih:D410CD9245AD33F8E6F385866193ECD60CB699F9&dn=Life&xl=1825361101&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce",
            "date_uploaded_unix" : 1452809070,
            "date_uploaded" : "2016-01-14 17:04:30",
            "size_bytes" : 1825361101,
            "size" : "1.7 GB",
            "peers" : 1,
            "seeds" : 14,
            "quality" : "1080p",
            "hash" : "D410CD9245AD33F8E6F385866193ECD60CB699F9",
            "url" : "https://yts.ag/torrent/download/D410CD9245AD33F8E6F385866193ECD60CB699F9"
        }
    ],
    "genres" : [
        "Action",
        "Biography",
        "Drama"
    ],
    "__v" : 0
}})
    try {
        if (!!movie && true) { // should verify download conditions in database
            return {success: true, status: 'success', message: "torrent file should be downloaded", data: movie}
        } else return {success: false, status: 'error', message: "torrent file won't be downloaded", data: movie}
    } catch(err) {
        log('File transfer authorization error: ', err)
    }
}

const selectTorrent = (torrents) => {
    if (!torrents || torrents.length < 1) throw new Error('no torrent available in database')
    let selected = []
    for (let i = _validResolution.indexOf(_preferredResolution);
	(selected.length === 0 && i < _validResolution.length);
	i += 1) {
        selected = torrents.filter(e => (e.quality === _validResolution[i])
        )
	}
    if (selected.length > 0) {
		return {
		torrent: selected[0],
		id: torrents.indexOf(selected[0])
		}
	}
	console.log('error')
}

const torrentFromMagnet = (magnet, cb) => {
    if (magnet) {
        let torrent = magnetURIDecode(magnet)
        cb(torrent)
    }
    return null
}

const torrentFromFile = (url, cb) => {
	try {
		https.get(url, res => {
			let rawData = Buffer.from('')
			res.on('data', chunk => {
				const chunkBuf = Buffer.from(chunk)
				rawData = Buffer.concat([rawData, chunkBuf], rawData.length + chunkBuf.length)
			}).on('error', e => {
				res.resume()
				throw e
			})
			res.on('end', () => {
                let torrent = bencode.decode(rawData, 'utf8')
                if (!torrent.announce || !(/^udp/.test(torrent.announce))) { throw new Error('improper torrent entry')}
                cb(torrent)

			})
		})
	} catch (e) {
		throw e
	}
}

const startDownload = torrent => {
    const torrentFile = new TorrentFile(torrent)
}

const torrent = async (movie, next) => {

    // this downloads the movie to fs and updates database
	// then next() is called to start streaming process. next() call should
	// happen when streaming process an be started
    // AND EXECUTED IN FULL without the need for some more buffering.

    try {
        const torrents = movie.torrents
        const file = selectTorrent(torrents)
		console.log(file)
        if (file.torrent.magnet) {
            torrentFromMagnet(file.torrent.magnet, startDownload)
        } else {
            torrentFromFile(file.torrent.url, startDownload)
        }
    } catch (e) {
        console.log(`Torrent API master error: ${e}`)
    }
}

export default torrentRoute;
