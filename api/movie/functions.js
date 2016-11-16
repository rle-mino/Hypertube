import omdb from 'omdb';
import pirate from 'thepiratebay';
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

const getFilmInfo = (req, res) => {
    const { code } = req.body; // on part du principe que code imdb = le film est en BDD
    const title = req.body.name;
    const magnet = req.body.magnet;
    if (code) {
        Movie.findOne({ code }, (err, found) => {
            if (found && found.extended) return (res.send({ result: found, status: 'success' }));
            omdb.get({ imdb: code }, true, (error, movie) => {
                if (error) return (res.send({ status: 'error', details: error }));
                update(found, movie);
                return (res.send({ result: found, status: 'success' }));
            });
            return (res.send({ status: 'error', details: 'movie not found' }));
        });
    } else {
        omdb.get({ title }, true, (error, movie) => {
            if (error) return (res.send({ status: 'error', details: error }));
            if (!movie) return (res.send({ result: { title, magnet }, status: 'success' }));
            Movie.findOne({ code: movie.imdb.id }, (err, found) => {
                if (found && found.extended) return (res.send({ result: found, status: 'success' }));
                const newMovie = new Movie({
                    torrents: {
                        magnet,
                    },
                });
                update(newMovie, movie);
                return (res.send({ result: newMovie, status: 'success' }));
            });
            return (false);
        });
    }
};

const tpb = async (title) => {
    const searchResults = await pirate.search(title, {
        category: '/search/0/99/207',
        orderBy: 'seeds',
        sortBy: 'desc',
    });
    return searchResults[0];
};

const search = (req, res) => {
    const { title } = req.query;
    Movie.find({ title: new RegExp(`.*${title}.*`, 'i') }, async (err, found) => {
        if (found.length > 0) return (res.send({ results: found, status: 'success' }));
        const tpbresult = await tpb(title);
        return res.send({ result: {
            title: tpbresult.name,
            magnet: tpbresult.magnetLink,
        },
        status: 'success' });
    });
};

export { search, getFilmInfo };
