// This collection of methods provide a complete integrtion of pieces management from parsing the torrent dictionary,
// reserving buffers and assigning each space to a seeder, to achieving ordered download and event emition

import https from 'https'
import chalk from 'chalk'
import crypto from 'crypto'
import {EventEmitter} from 'events'
import inherits from 'inherits'
import dgram from 'dgram'
import bencode from 'bencode'
import anon from './anonymizer'

const urlParse = require('url').parse

inherits(Piece, EventEmitter)
module.exports = Piece

const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))

function Piece (length) {
    EventEmitter.call(this)
    if (!(this instanceof Piece)) return new Piece(length)

    this.length = length
    this.missing = length
    this.reserved = 0
    this.completed = false
    this.status = 'empty'
}

Piece.prototype.init = function (hash, moviePiece, tracker, id) {
    this.id = id
    this.tracker = tracker
    this._tracker = urlParse(this.tracker.toString('utf8'))
    this.info_hash = hash
    this.key = ''
    this.peer_id = anon.newId()
    this.port = 6881
    this.downloaded = 0
    this.left = this.length
    this.uploaded = 0
    this.compact = ''
    this.Buffer = moviePiece
    this.status = 'ready'
    this.connect()
}

Piece.prototype.info = () => {
    this.Buffer.forEach(e => {
        if (!e) {elog('|')} else {ilog('|')}
    })
}

Piece.prototype.connect = function() {
    this.status = 'initialized'

    const p = this._tracker.port,
        h = this._tracker.host

    // get query should be updated url + trackers
    const MSG = Buffer.from('Le petit chat', 'utf8')
    this.client.send(MSG, 0, MSG.length, p, h, (err ) => {
        log(err.message)
    })
    this.client.on('message', msg => {
        ilog('.')
    })
}

Piece.prototype.client = dgram.createSocket('udp4')

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