/* eslint semi: ["error", "never"]*/
import EventEmitter from 'events'
import fs from 'fs'
import Transcoder from 'stream-transcoder'
import readChunk from 'read-chunk'
import fileType from 'file-type'
import * as info from '../movie/info'

// result.torrent[0].path


class MovieFile extends EventEmitter {
	constructor(req) {
		super()
		const _validResolution = [
			'8k',
			'2160p',
			'4k',
			'1440p',
			'1080p',
			'720p',
			'420p',
		]
		this._preferredResolution = '8k'
		this._req = req
		this.state = 'loading'
		if (req.query.path) {
			this._path = req.query.path
			this.name = req.query.path
		} else if (req.param.id) {
			this._movie = info.returnData(req).result
			this.name = this._movie.title || 'Hypertube'
			this._path = this._movie.path
		} else {
			throw new Error('Invalid query')
		}

		this._fileType = fileType(readChunk.sync(this._path, 0, 4100))
		this._fileType = this._fileType.mime
		console.log(this.name, this._fileType)
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
			})
			if (this._fileType === 'video/mp4') {
				console.log('streaming mp4')
				return stream
			} else if (/^video\//.test(this._fileType)) {
				console.log('transcoding mkv while streaming')
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
