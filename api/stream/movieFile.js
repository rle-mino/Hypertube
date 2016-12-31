
import * as info from '../movie/info'

class MovieStream extends EventEmitter {
  constructor = (req) => {
    this._validResolution = [
        '8k',
        '2160p',
        '4k',
        '1440p',
        '1080p',
        '720p',
        '420p',
    ]
    this. _preferredResolution = '8k'
    this._req = req
    this.state = 'loading'
    this._path = ''
    this._fileFormat = ''
    this._movie = await fetchMovie(req)
      if (req.query.path && req.query.name) {
        this.name = req.query.name
        this.path = req.query.path
      } else {
        this._movie = info.returnData(req).result
        this.name = this._movie.title
        this._path = selectPath(this._movie)
      }
    console.log('new movie: ', this._movie.title)
    this.state = loaded
    this.emit('loaded', )
  }
  selectPath = torrents => {
    for (let i = _validResolution.indexOf(_preferredResolution);
	     (selected.length === 0 && i < _validResolution.length);
       i += 1) {
        selected = torrents.filter(e => (e.quality === _validResolution[i]))
      if (selected.length > 0) {
  		return {
  		torrent: selected[0],
  		id: torrents.indexOf(selected[0])
  		}
  	}
  }
  }
}
