import request from 'request-json';
import pirate from 'thepiratebay';
import Movie from './movie_schema';

const fill = (movie) => {
    const { title } = movie;
    const { year } = movie;
    Movie.findOne({ title, year }, (err, found) => {
        if (!movie.torrents) return;
        movie.torrents.forEach((torrent) => {
            const trackers = '&tr=udp://tracker.internetwarriors.net:1337&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.openbittorrent.com:80&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://glotorrents.pw:6969/announce';
            const name = movie.title.replace(' ', '+');
            const link = encodeURI(`magnet:?xt=urn:btih:${torrent.hash}&dn=${name}${trackers}`);
            torrent.magnet = link;
        });
        if (!found) {
            const newMovie = new Movie({
                title: movie.title,
                year: movie.year,
                rated: movie.mpa_rating,
                runtime: movie.runtime,
                poster: movie.large_cover_image,
                genres: movie.genres,
                plot: movie.summary,
                code: movie.imdb_code,
                rating: movie.rating,
                torrents: movie.torrents,
            });
            newMovie.save();
        }
    });
};

const yts = () => {
    const client = request.createClient('https://yts.ag/api/v2/');
    client.get('list_movies.json', (err, response, body) => {
        const max = Math.ceil(body.data.movie_count / 50);
        for (let i = 1; i < max; i += 1) {
            client.get(`list_movies.json?limit=50&page=${i}`, (error, responsebis, bodybis) => {
                bodybis.data.movies.forEach((movie) => {
                    fill(movie);
                });
            });
            if (i === max - 1) console.log('Success! Database filled from YTS');
        }
    });
};

const tpb = async (req, res) => {
    const searchResults = await pirate.search('harry potter', {
        category: '/search/0/99/207',
        page: 3,
        orderBy: 'seeds',
        sortBy: 'desc',
    });
    console.log(searchResults);
};

export { yts, tpb };


// ajouter CRON pour recuperer les donnees
