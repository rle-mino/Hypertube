import OS from 'opensubtitles-api';
import fs from 'fs';
import request from 'request';

const getMovieSubs = (req, movie) => {
    const OpenSubtitles = new OS('OSTestUserAgentTemp');
    const lang = req.query.lg === 'en' ? 'eng' : 'fre';
    const { lg } = req.query;
    OpenSubtitles.search({
        sublanguageid: lang,
        imdbid: movie.code,
    }).then(subtitles => {
        if (!Object.keys(subtitles).length) {
            console.log(`No subtitles for ${movie.title} found in ${lang}`);
        } else if (req.query.lg === 'fr') {
            request(subtitles.fr.url, (error, response, body) => {
                console.log(body.length);
            });
        } else {
            request(subtitles.en.url).pipe(fs.createWriteStream('doodle.txt'));
        }
    }).catch(err => {
        getMovieSubs(req, movie);
    });
};

const getSerieSubs = (req, movie, episode) => {
    const OpenSubtitles = new OS('OSTestUserAgentTemp');
    const lang = req.query.lg === 'en' ? 'eng' : 'fre';
    const { lg } = req.query;
    OpenSubtitles.search({
        sublanguageid: lang,
        imdbid: movie.code,
        season: episode.season,
        episode: episode.episode,
    }).then(subtitles => {
        console.log(subtitles);
        if (!Object.keys(subtitles).length) {
            console.log(`No subtitles for ${movie.title} S${episode.season}E${episode.episode} found in ${lang}`);
        } else if (req.query.lg === 'fr') {
                console.log(subtitles.fr.url);
        } else {
                console.log(subtitles.en.url);
        }
    }).catch(err => {
        getSerieSubs(req, movie, episode);
        // console.log('could not load subtitles correctly, trying again');
    });
};

export { getMovieSubs, getSerieSubs };
