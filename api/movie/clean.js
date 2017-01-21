import fs from 'fs';
import Movie from './movie_schema';

const cleanMovie = () => {
  const now = Date.now();
  Movie.find({"torrents.path": {"$exists": true}}).then((movieList) => {
    movieList.map((movie) => {
      movie.torrents.map((torrent) => {
        if (torrent.lastViewed && ((torrent.lastViewed + 2629746000) > now)) {
          fs.unlink(torrent.path);
        }
      })
    })
  })
}

export default cleanMovie;
