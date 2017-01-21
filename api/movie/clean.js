import fs from 'fs';
import _ from 'lodash';
import Movie from './movie_schema';

const month = 2629746000;

const cleanMovie = (req, res, next) => {
  const now = Date.now();
  Movie.find({'torrents.path': {$exists: true}}).then((movieList) => {
    movieList.forEach((movie) => {
      movie.torrents.forEach((torrent, i) => {
        if (torrent.lastViewed && (now - torrent.lastViewed) > month) {
          if (fs.existsSync(torrent.path)) {
            fs.unlinkSync(torrent.path);
          }
          const newTorrent = _.omit(torrent, ['lastViewed', 'path']);
          movie.torrents.set(i, newTorrent);
          movie.save();
        }
      })
    })
  })
}

const cleanSerie = (req, res, next) => {
  const now = Date.now();
  Movie.find({'episodes.path': {$exists: true}}).then((movieList) => {
    movieList.forEach((movie) => {
      movie.episodes.forEach((episode, i) => {
        if (episode.lastViewed && (now - episode.lastViewed) > month) {
          if (fs.existsSync(episode.path)) {
            fs.unlinkSync(episode.path);
          }
          const newTorrent = _.omit(episode, ['lastViewed', 'path']);
          movie.episodes.set(i, newTorrent);
          movie.save();
        }
      })
    })
  })
}


export { cleanMovie, cleanSerie };
