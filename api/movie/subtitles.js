import OS from 'opensubtitles-api';
import fs from 'fs';
import request from 'request';

const getMovieSubs = async (req, movie) => {
    const OpenSubtitles = new OS('OSTestUserAgentTemp');
    const lang = req.query.lg === 'en' ? 'eng' : 'fre';
    const { lg } = req.query;
    const subtitlePath = `MovieLibrary/subtitles/${movie.code}.${lg}.srt`;
    if (!fs.existsSync(subtitlePath)) {
        OpenSubtitles.search({
            sublanguageid: lang,
            imdbid: movie.code,
        }).then(subtitles => {
            if (!Object.keys(subtitles).length) {
                console.log(`No subtitles for ${movie.title} found in ${lang}`);
                return (false);
            }
            if (req.query.lg === 'fr') {
                request(subtitles.fr.url).pipe(fs.createWriteStream(subtitlePath));
            } else {
                request(subtitles.en.url).pipe(fs.createWriteStream(subtitlePath));
            }
            while (1) {
                if (fs.existsSync(subtitlePath)) {
                    return (true);
                }
            }
        }).catch(err => {
            getMovieSubs(req, movie);
        });
    } else {
        return true;
    }
};

const getSerieSubs = async (req, movie, episode) => {
    const OpenSubtitles = new OS('OSTestUserAgentTemp');
    const lang = req.query.lg === 'en' ? 'eng' : 'fre';
    const { lg } = req.query;
    const subtitlePath = `MovieLibrary/subtitles/${movie.code}S${episode.season}E${episode.episode}.${lg}.srt`;
    if (!fs.existsSync(subtitlePath)) {
        OpenSubtitles.search({
            sublanguageid: lang,
            imdbid: movie.code,
            season: episode.season,
            episode: episode.episode,
        }).then(subtitles => {
            if (!Object.keys(subtitles).length) {
                console.log(`No subtitles for ${movie.title} found in ${lang}`);
                return (false);
            }
            if (req.query.lg === 'fr') {
                request(subtitles.fr.url).pipe(fs.createWriteStream(subtitlePath));
            } else {
                request(subtitles.en.url).pipe(fs.createWriteStream(subtitlePath));
            }
            while (1) {
                if (fs.existsSync(subtitlePath)) {
                    return (true);
                }
            }
        }).catch(err => {
            getSerieSubs(req, movie, episode);
        });
    } else {
        return true;
    }
};

export { getMovieSubs, getSerieSubs };
