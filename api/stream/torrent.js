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
            "title" : "Scoop",
            "year" : 2006,
            "rated" : "PG-13",
            "runtime" : 96,
            "poster" : "https://yts.ag/assets/images/movies/scoop_2006/large-cover.jpg",
            "plot" : "In the funeral of the famous British journalist Joe Strombel, his colleagues and friends recall how obstinate he was while seeking for a scoop. Meanwhile the deceased Joe discloses the identity of the tarot card serial killer of London. He cheats the Reaper and appears to the American student of journalism Sondra Pransky, who is on the stage in the middle of a magic show of the magician Sidney Waterman in London, and tells her that the murderer is the aristocrat Peter Lyman. Sondra drags Sid in her investigation, seeking for evidences that Peter is the killer. However, she falls in love with him and questions if Joe Strombel is right in his scoop.",
            "code" : "tt0457513",
            "rating" : 6.7,
            "pop" : 58,
            "extended" : false,
            "torrents" : [
            {
                "date_uploaded_unix" : 1467309532,
                "date_uploaded" : "2016-06-30 13:58:52",
                "size_bytes" : 730700186,
                "size" : "696.85 MB",
                "peers" : 10,
                "seeds" : 58,
                "quality" : "720p",
                "hash" : "51913A05D8AA6DF4E26450109BD4794FEFE08335",
                "url" : "https://yts.ag/torrent/download/59F43E533D483B157847C29FED0A54A07E6D1DB4.torrent"
            }
        ],
            "actors" : [],
            "genres" : [
            "Action",
            "Comedy",
            "Crime",
            "Mystery"
        ],
            "countries" : [],
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
        if (selected.length > 0) return ( !!selected[0].magnet ? selected[0].magnet : selected[0].url)
        }

    }
}

const torrentFromMagnet = magnet => {
        let magnetInfo = magnet2torrent(magnet)
    if (magnet && magnetInfo) {
        return magnetInfo['torrentURL']
        }
}

const torrentFromFile = (url, cb) => {
    https.get(url, res => {
        let rawData = Buffer.from('')
        res.on('data', chunk => {
            let chunkBuf = Buffer.from(chunk)
            rawData = Buffer.concat([rawData, chunkBuf], rawData.length + chunkBuf.length)
        }).on('error', e => {
            log(e.message)
            res.resume()
            throw e
        })
        res.on('end', () => {
            try {
                let torrent = bencode.decode(rawData, 'utf8')
                cb(torrent)
            } catch (e) {
                log(e.message)
            }
        })
    })
}

const startDownload = torrent => {
    let pieces = torrent.info.pieces,
        length = torrent.info['piece length'],
        files = torrent.info.files,
        trackers = torrent.announce,
        size = 0
    if (files && (files instanceof Array)) {
        files.forEach(e => {
            size += e.length
        })
    }
    let totalLength = torrent.info.length || size
    let torrentFile = new TorrentFile(trackers, pieces, length, totalLength, files)
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
        torrentFromFile(magnet, startDownload)
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