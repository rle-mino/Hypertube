import omdb from 'omdb';
import pirate from 'thepiratebay';
import ptn from 'parse-torrent-name';
import _ from 'lodash';
import Movie from './movie_schema';

const update = (doc, data) => {
    doc.title = data.title;
    if (Number.isInteger(data.year)) doc.year = data.year;
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
    const name = ptn(result).title;
    const season = ptn(result).season || '';
    const episode = ptn(result).episode || '';
    return ({ result: { title: name, season, episode, magnet: searchResults[0].magnetLink }, status: 'success' });
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

const getOmdb = async (tpbresult, res) => {
    omdb.get({ title: tpbresult.result.title }, true, (error, movie) => {
        if (error) return (res.send({ status: 'error', details: error }));
        if (movie) {
            Movie.find({ code: movie.imdb.id }, (dberr, dbfind) => {
                if (dberr) return (res.send({ status: 'error', details: dberr }));
                if (dbfind.length) return (res.send({ results: _.pick(dbfind[0], ['id', 'title', 'poster', 'year', 'rating', 'code']) }));
                const newMovie = new Movie();
                update(newMovie, movie);
                return (res.send({ results: [_.pick(newMovie, ['id', 'title', 'poster', 'year', 'rating', 'code'])] }));
            });
        } else {
            console.log('aaaaa');
            Movie.find({ title: tpbresult.result.title }, (err, found) => {
                if (err) return (res.send({ status: 'error', details: err }));
                if (found.length) return (res.send({ results: [_.pick(found[0], ['id', 'title'])] }));
                const newMovie = new Movie({
                    torrents: tpbresult.result.magnet,
                    title: tpbresult.result.title,
                });
                newMovie.save();
                return (res.send({ results: [_.pick(newMovie, ['id', 'title'])], status: 'success' }));
            });
        }
    });
};

const handleSearch = (req) => {
    const page = (!req.query.page || req.query.page === '') ? 0 : req.query.page;
    const title = (!req.query.title || req.query.title === '') ? '' : req.query.title;
    let sortBy = { title: 1 };
    if (req.query.sort === 'year') sortBy = { year: -1 };
    if (req.query.sort === 'rating') sortBy = { rating: -1 };
    const minyear = 1900;
    const maxyear = 2016;
    const minrating = 0;
    const maxrating = 10;
    const genre = 'Comedy';
    return ({ page, sortBy, title, minyear, maxyear, minrating, maxrating, genre });
};

const search = (req, res) => {
    const handled = handleSearch(req);
    Movie.find({
        title: new RegExp(`.*${handled.title}.*`, 'i'),
        year: { $gte: handled.minyear, $lte: handled.maxyear },
        rating: { $gte: handled.minrating, $lte: handled.maxrating },
        genres: handled.genre,
    }).sort(handled.sortBy).skip(20 * handled.page).limit(20).exec(async (err, found) => {
        if (found.length) {
            const results = found.map(el => _.pick(el, ['id', 'title', 'poster', 'year', 'rating', 'code']));
            return (res.send({ results, status: 'success' }));
        }
        const tpbresult = await tpb(handled.title);
        if (tpbresult.status !== 'success') return (res.send({ status: 'error', details: tpbresult.details }));
        await getOmdb(tpbresult, res);
        return false;
    });
};

export { search, fastSearch, topSearch, getFilmInfo };
