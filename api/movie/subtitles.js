import OS from 'opensubtitles-api';
import fs from 'fs';
import request from 'request';

const getMovieSubs = (req, movie) => {
    const OpenSubtitles = new OS('OSTestUserAgentTemp');
    const lang = req.query.lg === 'en' ? 'eng' : 'fre';
    const { lg } = req.query;
    const subtitlePath = `MovieLibrary/subtitles/${movie.code}.${lg}.srt`;
    OpenSubtitles.search({
        sublanguageid: lang,
        imdbid: movie.code,
    }).then(subtitles => {
        if (!Object.keys(subtitles).length) {
            console.log(`No subtitles for ${movie.title} found in ${lang}`);
        } else if (req.query.lg === 'fr') {
            request(subtitles.fr.url).pipe(fs.createWriteStream(subtitlePath));
        } else {
            request(subtitles.en.url).pipe(fs.createWriteStream(subtitlePath));
        }
    }).catch(err => {
        getMovieSubs(req, movie);
    });
};

const getSerieSubs = (req, movie, episode) => {
    const OpenSubtitles = new OS('OSTestUserAgentTemp');
    const lang = req.query.lg === 'en' ? 'eng' : 'fre';
    const { lg } = req.query;
    const subtitlePath = `public/subtitles/${movie.code}S${episode.season}E${episode.episode}.${lg}.srt`;
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
            request(subtitles.fr.url).pipe(fs.createWriteStream(subtitlePath));
        } else {
            request(subtitles.en.url).pipe(fs.createWriteStream(subtitlePath));
        }
    }).catch(err => {
        getSerieSubs(req, movie, episode);
        // console.log('could not load subtitles correctly, trying again');
    });
};

export { getMovieSubs, getSerieSubs };
