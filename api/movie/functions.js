import _ from 'lodash';
import Movie from './movie_schema';

// const update = (doc, data) => {
//     doc.title = data.title;
//     if (Number.isInteger(data.year)) doc.year = data.year;
//     doc.rated = data.rated;
//     doc.runtime = data.runtime;
//     doc.countries = data.countries;
//     doc.poster = data.poster;
//     doc.genres = data.genres;
//     doc.director = data.director;
//     doc.actors = data.actors;
//     doc.plot = data.plot;
//     doc.code = data.imdb.id;
//     doc.rating = data.imdb.rating;
//     doc.extended = true;
//     doc.save();
// };

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

const handleSearch = (req) => {
    const page = (!req.query.page || req.query.page === '') ? 0 : req.query.page;
    const title = (!req.query.title) ? '' : req.query.title;
    const genre = (!req.query.category || req.query.category === 'all') ? { $exists: true } : req.query.category;
    const minRate = (!req.query.minRate) ? 0 : req.query.minRate;
    const maxRate = (!req.query.maxRate) ? 10 : req.query.maxRate;
    const minYear = (!req.query.minYear) ? 1900 : req.query.minYear;
    const maxYear = (!req.query.maxYear) ? 2016 : req.query.maxYear;
    let sortBy = { title: 1 };
    if (req.query.sort === 'year') sortBy = { year: -1 };
    if (req.query.sort === 'rating') sortBy = { rating: -1 };
    return ({ page, sortBy, title, minYear, maxYear, minRate, maxRate, genre });
};

const search = (req, res) => {
    const handled = handleSearch(req);
    Movie.find({
        title: new RegExp(`.*${handled.title}.*`, 'i'),
        year: { $gte: handled.minYear, $lte: handled.maxYear },
        rating: { $gte: handled.minRate, $lte: handled.maxRate },
        genres: handled.genre,
    }).sort(handled.sortBy).skip(20 * handled.page).limit(20).exec(async (err, found) => {
        if (found.length) {
            const results = found.map(el => _.pick(el, ['id', 'title', 'poster', 'year', 'rating', 'code']));
            return (res.send({ results, status: 'success' }));
        }
        return (res.send({ status: 'error', details: 'no movie found' }));
    });
};

export { search, fastSearch, topSearch };
