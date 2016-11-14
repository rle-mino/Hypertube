import omdb from 'omdb';
import Movie from './movie_schema';

const fill = (data) => {
    const newMovie = new Movie({
        title: data.title,
        year: data.year,
        rated: data.rated,
        runtime: data.runtime,
        countries: data.countries,
        poster: data.poster,
        genres: data.genres,
        director: data.director,
        actors: data.actors,
        plot: data.plot,
        code: data.imdb.id,
        rating: data.imdb.rating,
    });
    newMovie.save();
    return (newMovie);
};

const search = (req, res) => {
    const { title } = req.query;
    const { year } = req.query;
    Movie.findOne({ title, year }, (err, found) => {
        if (found) return (res.send(found));
        omdb.get({ title, year }, true, (error, movie) => {
            if (error) return (res.send({ status: 'error', details: error }));
            if (!movie) return (res.send({ status: 'error', details: 'movie not found' }));
            const newMovie = fill(movie);
            return (res.send(newMovie));
        });
        return (false);
    });
};

export { search };


// on peut modifier search pour ne recuperer les infos imdb qu'en cas de demande user via le imdb id
