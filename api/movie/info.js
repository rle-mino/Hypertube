import _ from 'lodash';
import translate from 'google-translate-api';
import Movie from './movie_schema';

const popGenres = async (data, genres, found, id, type) => {
    genres = _.initial(genres);
    if (!genres.length || data.length >= 5) return data;
    const suggs = await Movie.find({
        _id: { $ne: id },
        genres,
        'episodes.0': { $exists: type === 'serie' },
    }).sort({ pop: -1 }).limit(5 - data.length);
    data = [...data, ...suggs];
    return popGenres(data, genres, found, id, type);
};

const getSerieInfo = (episodes) => {
    episodes.sort((a, b) => a.season - b.season || a.episode - b.episode);
    const seasons = [];
    episodes.forEach((episode) => {
        if (seasons.indexOf(episode.season) === -1) seasons.push(episode.season);
    });
    const serie = [];
    seasons.forEach((season) => serie.push({ episodes: [], season }));
    episodes.forEach((episode) => {
        serie.forEach((season) => {
            if (season.season === episode.season) {
                    season.episodes.push({
                    title: episode.eptitle,
                    magnet: episode.magnet,
                    episode: episode.episode,
                    season: episode.season,
                });
            }
        });
    });
    return (serie);
};

const getEpisode = (episodes, season, episode) =>
    episodes.filter((ep) =>
        ep.season === parseInt(season, 10) && ep.episode === parseInt(episode, 10),
);

const returnData = async (req) => {
    const id = req.params.id || req.body.id;
    const season = req.query.s || req.body.season;
    const episode = req.query.e || req.body.episode;
    let found = await Movie.findOne({ _id: id });
    if (!found) return ({ status: 'error', details: 'Movie not found' });
    const type = found.episodes[0] ? 'serie' : 'movie';
    if (type === 'serie') {
        found = found.toObject();
        found.torrents = getEpisode(found.episodes, season, episode);
        delete found.episodes;
    }
    return ({ result: found, status: 'success' });
};

const addHistory = async (req, res) => {
  const user = req.loggedUser;
  const title = req.body.title;
  const id = req.body.id;
  const movie = await Movie.findOne({ _id: id });
  const video = {
    title,
    id,
    year: movie.year,
    poster: movie.poster,
    rating: movie.rating,
  };
  if (_.findIndex(user.history, { id }) === -1) {
    user.history.push(video);
    user.save();
  }
  res.send({ status: 'success' });
};

const inHistory = (history, id) => {
  let inArray = false;
  history.forEach((movie) => {
    if (movie.id === id) {
      inArray = true;
    }
  });
  return inArray;
};

const getData = (req, res) => {
    const id = req.params.id;
    const viewed = inHistory(req.loggedUser.history, req.params.id);
    Movie.findOne({ _id: id }, async (err, found) => {
        if (err || !found) return (res.send({ status: 'error', details: 'Movie not found' }));
        const genres = found.genres;
        const type = found.episodes[0] ? 'serie' : 'movie';
        if (type === 'serie') {
            found = found.toObject();
            found.seasons = await getSerieInfo(found.episodes);
            delete found.episodes;
        }
        if (req.query.lg !== 'en') {
            found.plot = await translate(found.plot, { from: 'en', to: req.query.lg }).then((result) => result.text);
        }
        const comments = found.comments.reverse().slice(0, 20);
        Movie.find({
            _id: { $ne: id },
            genres,
            'episodes.0': { $exists: type === 'serie' },
        }).sort({ pop: -1 }).limit(5).exec(async (err1, found1) => {
                found1 = await popGenres(found1, genres, found, id, type);
                let suggestions = found1.map(suggs => _.pick(suggs, ['id', 'title', 'poster', 'year', 'rating', 'code']));
                if (found1.length < 5) {
                     const suggs = await Movie.find({
                        _id: { $ne: id },
                        genres: genres[0],
                        'episodes.0': { $exists: type === 'serie' },
                    }).sort({ pop: -1 }).limit(5);
                    suggestions = suggs.map(suggests => _.pick(suggests, ['id', 'title', 'poster', 'year', 'rating', 'code']));
                }
				// req.loggedUser.history.map((el) => {
				// 	if (el.title === found.title) {
				// 		found.viewed = true;
				// 	} else {
				// 		found.viewed = false;
				// 	}
				// });
				let result = { ...found._doc, viewed };
                if (type === 'serie') result = { ...found, viewed };
                return (res.send({ result, comments, suggestions, status: 'success' }));
        });
        return (false);
    });
};

export { getData, returnData, addHistory };
