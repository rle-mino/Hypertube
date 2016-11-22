// This collection of methods provide a complete integrtion of pieces management from parsing the torrent dictionary,
// reserving buffers and assigning each space to a seeder, to achieving ordered download and event emition

import https from 'https'
import chalk from 'chalk'
import crypto from 'crypto'
import {EventEmitter} from 'events'
import inherits from 'inherits'

inherits(Piece, EventEmitter)
module.exports = Piece

const log = m => console.log(chalk.blue(m))

function Piece (length) {
    EventEmitter.call(this)
    if (!(this instanceof Piece)) return new Piece(length)

    this.length = length
    this.missing = length
    this.reserved = 0
    this.completed = false
    this.status = 'empty'
}

Piece.prototype.init = function (hash, trackers, id) {
    this.id = id
    this.trackers = trackers
    this.hash = hash
    this.Buffer = Buffer.from('')
    this.status = 'ready'
    console.log(id, hash, trackers)
}

Piece.prototype.download = () => {
    this.status = 'initialized'

    // get query should be updated

    https.get(url, res => {
        this.status = 'downloading'
        res.on('data', chunk => {
            log(`downloaded ${this.Buffer.length} of ${this.length} from piece ${id}`)
            let chunkBuf = Buffer.from(chunk)
            this.Buffer = Buffer.concat([this.Buffer, chunkBuf], this.Buffer.length + chunkBuf.length)
        }).on('error', e => {
            res.resume()
            this.status = 'error'
            this.download()
            log(e.message + " : RESTARTING...")
        })
        res.on('end', () => {
            this.completed = true
            this.status = 'complete'
            // copy file from Buffer to fs
        })
    })
}

Piece.prototype.check = () => {
// get hash from downloaded piece and compare to hash from torrent file
    if (true) {
        this.status = 'finished'
        this.emit('done')
    } else {
        this.status = 'error'
        this.download()
    }
}

Piece.prototype.destroy = () => {
    this.status = 'autodestroy'
    // this should empty Buffer, reset all keys and call for parent object unsetKey method of this.id property
}

Piece.prototype.status = () => {return this.status}