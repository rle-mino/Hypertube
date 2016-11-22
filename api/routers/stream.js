import torrent                  from '../stream/torrent.js'
import stream                   from '../stream/stream'

export default (app) => {
	app.get('/api/stream', torrent, stream)
}