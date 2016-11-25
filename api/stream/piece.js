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
	this.received = new Array(size).fill(false)
	this.requested = new Array(size).fill(false)
}

Piece.prototype.addRequested = pieceIndex => {
	this.requested[pieceIndex] = true
}

Piece.prototype.addReceived = pieceIndex => {
	this.received[pieceIndex] = true
}

Piece.prototype.needed = pieceIndex => {
	if (this.requested.every(i => i === true)) {
		this.requested = this.received.slice()
	}
	return !this.requested[pieceIndex]
}

Piece.prototype.isDone = () => {
	return this.received.every(i => i === true)
}
