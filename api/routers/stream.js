import torrent                  from '../torrent/torrent'
import stream                   from '../stream/stream'

export default (app) => {
	app.get('/api/stream', torrent, stream)
}