// torrent.js validates a movie identified in the request and downloads it if its status is not downloaded. If
// downloaded or when enough downloaded for being played, outputed video+audio+cc files are encrypted into HTML 5
// compliant video format:
//<video>: VP8 and Vorbis in WebM
//<video>: VP9 and Opus in WebM
//<video>: Streaming WebM via MSE
//<video>: Theora and Vorbis in Ogg
//<video>: H.264 and MP3 in MP4
//<video>: H.264 and AAC in MP4 <============ PREFERABLY
//<video>: FLAC in MP4

import bencode from 'bencode'
import KBucket from 'k-bucket'
import crypto from 'crypto'
import {EventEmitter} from 'events'
import inherits from 'inherits'
import chalk from 'chalk'
import https from 'https'
import axios from 'axios'
import magnet2torrent from 'magnet2torrenturl'
import Piece from './piece'
import tracker from './tracker'
import TorrentFile from './Torrentfile'

// inherits(torrent, EventEmitter)

const log = m => console.log(chalk.blue(m))
let request = axios.create()

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
        "title" : "Burn After Reading",
        "year" : 2008,
        "runtime" : 96,
        "poster" : "https://yts.ag/assets/images/movies/Burn_After_Reading_2008/large-cover.jpg",
        "plot" : "Osbourne Cox, a Balkan expert, resigned from the CIA because of a drinking problem, so he begins a memoir. His wife wants a divorce and expects her lover, Harry, a philandering State Department marshal, to leave his wife. A CD-ROM falls out of a gym bag at a Georgetown fitness center. Two employees there try to turn it into cash: Linda, who wants money for cosmetic surgery, and Chad, an amiable goof. Information on the disc leads them to Osbourne who rejects their sales pitch; then they visit the Russian embassy. To sweeten the pot, they decide they need more of Osbourne's secrets. Meanwhile, Linda's boss likes her, and Harry's wife leaves for a book tour. All roads lead to Osbourne's house.",
        "code" : "tt0887883",
        "rating" : 7,
        "pop" : 54.5,
        "episodes" : [],
        "torrents" : [
        {
            "magnet" : "magnet:?xt=urn:btih:861B3B729C5C61A4D13E606AC2AF144E55606983&dn=Burn+After%20Reading&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://glotorrents.pw:6969/announce",
            "date_uploaded_unix" : 1446344125,
            "date_uploaded" : "2015-10-31 22:15:25",
            "size_bytes" : 734045143,
            "size" : "700.04 MB",
            "peers" : 8,
            "seeds" : 67,
            "quality" : "720p",
            "hash" : "861B3B729C5C61A4D13E606AC2AF144E55606983",
            "url" : "https://yts.ag/torrent/download/861B3B729C5C61A4D13E606AC2AF144E55606983"
        },
        {
            "magnet" : "magnet:?xt=urn:btih:69c854a7ee83eae559f6a6b552963a032c6e9853&dn=The.Night.Of.S01E01.HDTV.x264-BATV%5Beztv%5D.mkv%5Beztv%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A80&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969",
            "date_uploaded_unix" : 1446344127,
            "date_uploaded" : "2015-10-31 22:15:27",
            "size_bytes" : 1395864371,
            "size" : "1.30 GB",
            "peers" : 4,
            "seeds" : 42,
            "quality" : "1080p",
            "hash" : "B55CC9E26250A65FB1915DFA4DE6EA8D74551DBA",
            "url" : "https://yts.ag/torrent/download/861B3B729C5C61A4D13E606AC2AF144E55606983"
        }
    ],
        "genres" : [
        "Action",
        "Comedy",
        "Crime",
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
    else {
        let selected = []
        for (let i = _validResolution.indexOf(_preferredResolution); (selected.length === 0 || i < _validResolution.length); i++) {
            selected = torrents.filter(e => {
                return (e.quality === _validResolution[i])
            })
        if (selected.length > 0) return ( !!selected[0].url ? selected[0].url : selected[0].magnet)
        }

    }
}

const torrentFromMagnet = magnet => {
    if (magnet) {
        https.get(magnet, res => {
            let rawData = Buffer.from('')
            res.on('data', chunk => {
                let chunkBuf = Buffer.from(chunk)
                rawData = Buffer.concat([rawData, chunkBuf], rawData.length + chunkBuf.length)
            }).on('error', e => {
                res.resume()
                throw e
            })
            res.on('end', () => {
                try {
                } catch (e) {
                    throw e
                }
            })
        })
    }
    return null
}

const torrentFromFile = (url, cb) => {
    https.get(url, res => {
        let rawData = Buffer.from('')
        res.on('data', chunk => {
            let chunkBuf = Buffer.from(chunk)
            rawData = Buffer.concat([rawData, chunkBuf], rawData.length + chunkBuf.length)
        }).on('error', e => {
            res.resume()
            throw e
        })
        res.on('end', () => {
            try {
                let torrent = bencode.decode(rawData, 'utf8')
                cb(torrent)
            } catch (e) {
                throw e
            }
        })
    })
}

const startDownload = torrent => {
    let size = 0
    if (files && (files instanceof Array)) {
        files.forEach(e => {
            size += e.length
        })
    }
    let totalLength = torrent.info.length || size
    let torrentFile = new TorrentFile(torrent, totalLength)
}

const torrent = async (movie, next) => {

    // this downloads the movie to fs and updates database
    // then next() is called to start streaming process. next() call should happen when streaming process an be started
    // AND EXECUTED IN FULL without the need for some more buffering.

    try {
        const torrents = movie.torrents
        let magnet = selectTorrent(torrents)
        let torrent = {}
        if (/^magnet/.test(magnet)) {
            magnet = torrentFromMagnet(magnet)
        }
        if (magnet) {
            torrentFromFile(magnet, startDownload)
        }
    } catch (e) {
        console.log(`Torrent API master error: ${e}`)
    }
    

    
}

// inverts two values in a list
const swap =  (list, a, b) => {
    if (a === b) return
    let tmp = list[a]
    list[a] = list[b]
    list[b] = tmp
    list[a].index = a
    list[b].index = b
}

// randomizes selection of n out of values
const pick = (values, n) => {
    var len = Math.min(values.length, n)
    var ptr = 0
    var res = new Array(len)

    for (var i = 0; i < len; i++) {
        var next = ptr + (Math.random() * (values.length - ptr)) | 0
        res[ptr] = values[next].peer
        swap(values, ptr++, next)
    }

    return res
}

export default torrentRoute;