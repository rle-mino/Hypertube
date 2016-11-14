import omdb from 'omdb';
import Movie from './movie_schema';

const update = (doc, data) => {
    doc.title = data.title;
    doc.year = data.year;
    doc.rated = data.rated;
    doc.runtime = data.runtime;
    doc.countries = data.countries;
    doc.poster = data.poster;
    doc.genres = data.genres;
    doc.director = data.director;
    doc.actors = data.actors;
    doc.plot = data.plot;
    doc.code = data.imdb.id;
    doc.rating = data.imdb.rating;
    doc.extended = true;
    doc.save();
};

const search = (req, res) => {
    const { title } = req.query;
    const { year } = req.query;
    Movie.findOne({ title, year }, (err, found) => {
        if (found && found.extended) return (res.send({ result: found, status: 'success' }));
        omdb.get({ title, year }, true, (error, movie) => {
            if (error) return (res.send({ status: 'error', details: error }));
            if (!movie) return (res.send({ status: 'error', details: 'movie not found' }));
            if (found) update(found, movie);
            return (res.send({ result: found, status: 'success' }));
        });
        return (false);
    });
};

export { search };
