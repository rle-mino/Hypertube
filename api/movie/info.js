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

const getData = (req, res) => {
    const id = req.params.id;
    Movie.findOne({ _id: id }, async (err, found) => {
        if (err || !found) return (res.send({ status: 'error', details: 'Movie not found' }));
        const genres = found.genres;
        const type = found.episodes[0] ? 'serie' : 'movie';
        if (req.query.lg !== 'en') {
            found.plot = await translate(found.plot, { from: 'en', to: req.query.lg }).then((result) => result.text);
        }
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
                return (res.send({ result: found, suggestions, status: 'success' }));
        });
        return (false);
    });
};

export { getData };
