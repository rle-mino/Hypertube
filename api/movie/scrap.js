import request from 'request-json';
import _ from 'lodash';
import omdb from 'omdb';
import Movie from './movie_schema';

const getPath = (episodes, season, episode) =>
episodes.filter((ep) =>
ep.season === season && ep.episode === episode,
);

const getIndex = (episodes, season, episode) => {
    for (let i = 0; i < episodes.length; i += 1) {
        if (episodes[i].season === season && episodes[i].episode === episode) return i;
    }
};

const addPath = (req) => {
    const id = req.params.id;
    const path = req.query.path || null;
    const season = req.query.s;
    const episode = req.query.e;
    const q = Number(req.query.q) || 0;
    Movie.findOne({ _id: id }, async (err, found) => {
        if (err || !found) return;
        if (found.torrents.length) {
            const torrents = found.torrents;
            torrents[q].path = path;
            torrents.set(q, torrents[q]);
            found.save();
        } else if (season && episode) {
            const index = getIndex(found.episodes, Number(season), Number(episode));
            const serieEpisode = found.episodes[index];
            serieEpisode.path = path;
            found.episodes.set(index, serieEpisode);
            found.save();
        }
    });
};

const updateEpisodes = (episodes, oldepisodes) => {
    const newEpisodes = [];
    episodes.forEach((episode) => {
        const torrent = Object.values(episode.torrents).pop();
        const quality = Object.keys(episode.torrents).pop();
        if (torrent) {
            if (torrent.url.substring(0, 7) !== 'magnet:') return;
            const hash = torrent.url.match(/btih:(.*?)&/i)[1];
            let path = null;
            if (getPath(oldepisodes, episode.season, episode.episode).length) {
                path = getPath(oldepisodes, episode.season, episode.episode)[0].path;
            }
            newEpisodes.push({
                path,
                quality,
                hash,
                magnet: torrent.url,
                season: episode.season,
                episode: episode.episode,
                eptitle: episode.title,
            });
        }
    });
    return newEpisodes;
};

const addSerie = (serie) => {
    const title = serie.title;
    Movie.findOne({ code: serie.imdb_id }, (err, found) => {
        if (!serie.episodes || !serie.episodes.length) return;
        if (found && found.episodes.length !== serie.episodes.length) {
            console.log(`${title} updated`);
            found.episodes = updateEpisodes(serie.episodes, found.episodes);
            found.save();
        }
        if (!found) {
            omdb.get({ imdb: serie.imdb_id }, false, (error, movie) => {
                // if (error) return (console.log('err: ', error));
                if (error) return (console.log('...'));
                if (!movie) return (console.log('movie error'));
                console.log(title);
                const episodes = [];
                serie.episodes.forEach((episode) => {
                    const torrent = Object.values(episode.torrents).pop();
                    const quality = Object.keys(episode.torrents).pop();
                    if (torrent) {
                        if (torrent.url.substring(0, 7) !== 'magnet:') return;
                        const hash = torrent.url.match(/btih:(.*?)&/i)[1];
                        episodes.push({
                            quality,
                            hash,
                            magnet: torrent.url,
                            season: episode.season,
                            episode: episode.episode,
                            eptitle: episode.title,
                        });
                    }
                });
                const genres = [];
                serie.genres.forEach((genre) => {
                    if (genre === 'science-fiction') {
                        genres.push('Sci-Fi');
                    } else {
                        genres.push(_.capitalize(genre));
                    }
                });
                const newMovie = new Movie({
                    title,
                    year: serie.year,
                    runtime: serie.runtime,
                    poster: movie.poster,
                    genres,
                    plot: serie.synopsis,
                    code: serie.imdb_id,
                    episodes,
                    rating: movie.imdb.rating,
                    pop: serie.rating.votes, // les seeds sont tous à 0
                    actors: movie.actors,
                    director: movie.director,
                    writer: movie.writer,
                });
                newMovie.save();
            });
        }
    });
};

const addMovie = (movie) => {
    const title = movie.title;
    Movie.findOne({ code: movie.imdb_code }, (err, found) => {
        if (!movie.torrents || !movie.torrents.length) return;
        movie.torrents.forEach((torrent) => {
            const trackers = '&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://glotorrents.pw:6969/announce';
            const name = movie.title.replace(' ', '+');
            const link = encodeURI(`magnet:?xt=urn:btih:${torrent.hash}&dn=${name}${trackers}&xl=${torrent.size_bytes}`);
            torrent.magnet = link;
        });
        if (!found) {
            omdb.get({ imdb: movie.imdb_code }, false, (error, data) => {
                // if (error) return (console.log('err: ', error));
                if (error) return (console.log('...'));
                if (!data) return (console.log('movie error'));
                let pop = 0;
                console.log(title);
                movie.torrents.forEach((torrent) => {
                    pop += torrent.seeds;
                });
                pop /= movie.torrents.length;
                const newMovie = new Movie({
                    title: movie.title,
                    year: movie.year,
                    runtime: movie.runtime,
                    poster: data.poster,
                    genres: movie.genres,
                    plot: movie.summary,
                    code: movie.imdb_code,
                    rating: movie.rating,
                    torrents: movie.torrents,
                    pop,
                    actors: movie.actors,
                    director: movie.director,
                    writer: movie.writer,
                });
                newMovie.save();
            });
        }
    });
};

const yts = () => {
    const client = request.createClient('https://yts.ag/api/v2/');
    client.get('list_movies.json', (error, response, body) => {
        if (typeof body !== 'object') return (console.log('Could not get data from YTS'));
        const max = Math.ceil(body.data.movie_count / 50);
        for (let i = 1; i <= max; i += 1) {
            client.get(`list_movies.json?limit=50&page=${i}`, (err, res, data) => {
                if (typeof data === 'object') data.data.movies.forEach((movie) => addMovie(movie));
            });
            // if (i === max - 1) console.log('Success! Database filled from YTS');
        }
    });
};

const eztvPrepare = (id) => {
    const client = request.createClient('http://eztvapi.ml/');
    // const client = request.createClient('https://popcornwvnbg7jev.onion.to/');
    client.get(`show/${id}`, (error, response, body) => {
        if (typeof body === 'object') addSerie(body);
    });
};

const eztv = () => {
    const client = request.createClient('http://eztvapi.ml/');
    // const client = request.createClient('https://popcornwvnbg7jev.onion.to/');
    client.get('shows', (error, response, body) => {
        if (typeof body !== 'object') return (console.log('Could not get data from EZTV'));
        const max = body.pop().split('/')[1];
        for (let i = 1; i <= max; i += 1) {
            client.get(`shows/${i}`, (err, res, data) => {
                if (typeof data === 'object') data.map((serie) => eztvPrepare(serie.imdb_id));
            });
        }
    });
 };

export { yts, eztv, addPath };
