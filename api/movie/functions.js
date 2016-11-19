import omdb from 'omdb';
import pirate from 'thepiratebay';
import ptn from 'parse-torrent-name';
import _ from 'lodash';
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
    const { code } = req.body;
    const title = req.body.title;
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
                const newMovie = new Movie({ torrents: { magnet } });
                update(newMovie, movie);
                return (res.send({ result: newMovie, status: 'success' }));
            });
            return (false);
        });
    }
};

const tpb = async (title) => {
    const searchResults = await pirate.search(title, {
        category: 'video',
        orderBy: 'seeds',
        sortBy: 'desc',
    });
    if (!searchResults[0]) return ({ status: 'error', details: 'movie not found' });
    const result = searchResults[0].name;
    let name = ptn(result).title;
    if (ptn(result).season && ptn(result).episode) name = `${name} S${ptn(result).season}E${ptn(result).episode}`;
    return ({ result: { title: name, magnet: searchResults[0].magnetLink }, status: 'success' });
};

const fastSearch = (req, res) => {
    const { title } = req.query;
    if (!req.query.title || req.query.title === '') return (res.send({ status: 'error', details: 'empty field' }));
    Movie.find({ title: new RegExp(`.*${title}.*`, 'i') }).sort({ title: 1 }).limit(5).exec(async (err, found) => {
		const results = found.map(el => _.pick(el, ['id', 'title', 'poster', 'year', 'rating', 'code']));
        if (found.length > 0) return (res.send({ results, status: 'success' }));
        return (res.send({ status: 'error', details: 'no movie found' }));
    });
    return (false);
};

const topSearch = (req, res) => {
    Movie.find().sort({ pop: -1 }).limit(20).exec(async (err, found) => {
        if (err || !found.length) return (res.send({ status: 'error', details: 'DB problem' }));
        const results = found.map(el => _.pick(el, ['id', 'title', 'poster', 'year', 'rating']));
        return (res.send({ results, status: 'success' }));
    });
};

const search = (req, res) => {
    if (!req.query.title || req.query.title === '') return (res.send({ status: 'error', details: 'empty field' }));
    const page = (!req.query.page || req.query.page === '') ? 0 : req.query.page;
    const title = req.query.title;
    Movie.find({ title: new RegExp(`.*${title}.*`, 'i') }).sort({ title: 1 }).skip(20 * page).limit(20).exec(async (err, found) => {
        if (found.length) {
            const results = found.map(el => _.pick(el, ['id', 'title', 'poster', 'year', 'rating', 'code', 'pop']));
            return (res.send({ results, status: 'success' }));
        }
        const tpbresult = await tpb(title);
        if (tpbresult.status !== 'success') return (res.send({ status: 'error', details: tpbresult.details }));
        omdb.get({ title: tpbresult.result.title }, true, (error, movie) => {
            if (error) return (res.send({ status: 'error', details: error }));
            if (!movie) {
                const newMovie = new Movie({
                    torrents: tpbresult.result.magnet,
                    title: tpbresult.result.title,
                });
                newMovie.save();
                return (res.send({ results: _.pick(newMovie, ['id', 'title']), status: 'success' }));
            }
            Movie.find({ code: movie.imdb.id }, (dberr, dbfind) => {
                if (dberr) return (res.send({ status: 'error', details: dberr }));
                if (dbfind.length) return (res.send({ results: _.pick(dbfind[0], ['id', 'title', 'poster', 'year', 'rating', 'code']) }));
                const newMovie = new Movie();
                update(newMovie, movie);
                return (res.send({ results: _.pick(newMovie, ['id', 'title', 'poster', 'year', 'rating', 'code']) }));
            });
            return (false);
        });
        return (false);
    });
    return (false);
};

export { search, fastSearch, topSearch, getFilmInfo };
