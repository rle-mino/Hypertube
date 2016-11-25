import _ from 'lodash';
import Movie from './movie_schema';

const popGenres = async (data, genres, found, id, type) => {
    if (!genres.length || data.length >= 5) return data;
    genres.pop();
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
    Movie.findOne({ _id: id }, (err, found) => {
        if (err || !found) return (res.send({ status: 'error', details: 'Movie not found' }));
        const genres = found.genres;
        const type = found.episodes[0] ? 'serie' : 'movie';
        Movie.find({
            _id: { $ne: id },
            genres,
            'episodes.0': { $exists: type === 'serie' },
        }).sort({ pop: -1 }).limit(5).exec(async (err1, found1) => {
                found1 = await popGenres(found1, genres, found, id, type);
                const suggestions = found1.map(suggs => _.pick(suggs, ['id', 'title', 'poster', 'year', 'rating', 'code']));
                return (res.send({ result: found, suggestions, status: 'success' }));
        });
    });
};

export { getData };
