/* eslint semi: ["error", "never"]*/
import EventEmitter		from 'events'
import fs				from 'fs'
import path				from 'path'
import Transcoder		from 'stream-transcoder'
import readChunk		from 'read-chunk'
import fileType			from 'file-type'

import * as info		from '../movie/info'

const movieFolder = `public${path.sep}`

class MovieFile extends EventEmitter {
	constructor(req, res) {
		super()
		const self = this
		this._validResolution = [
			'8k',
			'2160p',
			'4k',
			'1440p',
			'1080p',
			'720p',
			'480p',
			'420p',
		]
		this._preferredResolution = req.query.r || '8k'
		this._req = req
		this._res = res
		this.state = 'loading'
		this.emit('loading')

		if (req.query.path) {
			this._path = movieFolder + req.query.path
			this.name = req.query.path
			console.log(this._path)
		} else if (req.param.id) {
			this._movie = info.returnData(req).result
			this.name = this._movie.path
			this._path = movieFolder + this._movie.path
		} else {
			throw new Error('Invalid query')
		}
		/*const range = req.header.range
		if (!range) {
			this.emit('error')
		}
		fs.stat(this._path, (err, stats) => {
			if (err) {
				if (err.code === 'ENOENT') {
					// 404 Error if file not found
					return res.sendStatus(404)
				}
				return res.end(err)
			}
			this.stats = stats
		})
			this.positions = range.replce(/bytes=/, '').split('-')
			this.start = parseInt(this.positions[0], 10)
			this.total = this.stats.size
			this.end = this.positions[1] ? parseInt(this.positions[1], 10) : this.total - 1
			this.chunksize = (this.end - this.start) + 1

			res.writeHead(206, {
				'Content-Range': `bytes ${this.start}-${this.end}/${this.total}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': this.chunksize,
				'Content-Type': 'video/mp4',
			}) */

		this._fileType = fileType(readChunk.sync(this._path, 0, 4100))
		this._fileType = this._fileType.mime || 'video/mkv'
		this.state = 'loaded'
		this.emit('loaded', this.name)

		this._selectPath = torrents => {
			let selected = []
			for (let i = this._validResolution.indexOf(this._preferredResolution);
				(selected.length === 0 && i < this._validResolution.length);
				i += 1) {
					selected = torrents.filter(e => (e.quality === this._validResolution[i]))
				if (selected.length > 0) {
					return selected[0].path
				}
			}
			return null
		}

		this.stream = () => {
			const stream = fs.createReadStream(this._path, {
				flags: 'r',
				start: 0,
				end: req.query.size
			})
			this.emit('streaming', this.name)
			if (this._fileType === 'video/mp4') {
				return stream
			} else if (/^video\//.test(this._fileType)) {
				return new Transcoder(stream)
					.videoCodec('h264')
					.audioCodec('aac')
					.format('mp4')
					.stream()
			}
			throw new Error('not a supported video file')
		}
	}
}

export default MovieFile
