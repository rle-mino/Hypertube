import chalk from 'chalk'
import LRU from 'lru'
import anon from './anonymizer'
import {EventEmitter} from 'events'
import inherits from 'inherits'
import bencode from 'bencode'
import crypto from 'crypto'
import * as queries from './KRPC/quieries'
import * as responses from './KRPC/responses'
import * as error from './KRPC/error'
import RPC from './KRPC/rpc'


const log = m => console.log(chalk.blue(m))
const ilog = m => process.stdout.write(chalk.cyan(m))
const elog = m => process.stdout.write(chalk.red(m))
const ylog = m => process.stdout.write(chalk.yellow(m))
const blog = m => process.stdout.write(chalk.blue(m))


const __rotate_interval = 5 * 60 * 1000

function DHT (opts) {
	if (!(this instanceof DHT)) return new DHT(opts)
	if (!opts) opts = {}

	let self = this

	this._tables = LRU({maxAge: __rotate_interval, max: opts.maxTables || 1000})
}

DHT.prototype.query = (payload) => {
	this.client.on('message', msg => {
		responses.parseRes(msg)
	})
}
