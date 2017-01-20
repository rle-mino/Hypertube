// import torrent                  from '../torrent/torrent'
import * as stream                   from '../stream/stream'

export default (app) => {
	app.get('/api/stream/:id', stream.streamRoute)
}
