import OS from 'opensubtitles-api';
import fs from 'fs';
import request from 'request';
import srt2vtt from 'srt-to-vtt';

const absPath = 'public/subtitles/';

const getMovieSubs = async (movie) => {
    const OpenSubtitles = new OS('OSTestUserAgentTemp');
    const oSTPath = `${absPath}${movie.code}.en`;
    const frSTPath = `${absPath}${movie.code}.fr`;
    if (!fs.existsSync(`${oSTPath}.vtt`) && !fs.existsSync(`${frSTPath}.vtt`)) {
        OpenSubtitles.search({
            imdbid: movie.code,
        }).then(subtitles => {
            if (subtitles.en) {
                const download = request(subtitles.en.url).pipe(fs.createWriteStream(`${oSTPath}.srt`));
                download.on('finish', () => {
                    fs.createReadStream(`${oSTPath}.srt`)
                    .pipe(srt2vtt())
                    .pipe(fs.createWriteStream(`${oSTPath}.vtt`));
                    fs.unlinkSync(`${oSTPath}.srt`);
                });
            }
            if (subtitles.fr) {
                const download = request(subtitles.fr.url).pipe(fs.createWriteStream(`${frSTPath}.srt`));
                download.on('finish', () => {
                    fs.createReadStream(`${frSTPath}.srt`)
                    .pipe(srt2vtt())
                    .pipe(fs.createWriteStream(`${frSTPath}.vtt`));
                    fs.unlinkSync(`${frSTPath}.srt`);
                });
            }
        }).catch(err => {
            getMovieSubs(movie);
        });
    }
};

const getSerieSubs = async (movie, episode) => {
    const OpenSubtitles = new OS('OSTestUserAgentTemp');
    const oSTPath = `${absPath}${movie.code}S${episode[0].season}E${episode[0].episode}.en`;
    const frSTPath = `${absPath}${movie.code}S${episode[0].season}E${episode[0].episode}.fr`;
    if (!fs.existsSync(`${oSTPath}.vtt`) && !fs.existsSync(`${frSTPath}.vtt`)) {
        OpenSubtitles.search({
            imdbid: movie.code,
            season: episode.season,
            episode: episode.episode,
        }).then(subtitles => {
            if (subtitles.en) {
                const download = request(subtitles.en.url).pipe(fs.createWriteStream(`${oSTPath}.srt`));
                download.on('finish', () => {
                    fs.createReadStream(`${oSTPath}.srt`)
                    .pipe(srt2vtt())
                    .pipe(fs.createWriteStream(`${oSTPath}.vtt`));
                    fs.unlinkSync(`${oSTPath}.srt`);
                });
            }
            if (subtitles.fr) {
                const download = request(subtitles.fr.url).pipe(fs.createWriteStream(`${frSTPath}.srt`));
                download.on('finish', () => {
                    fs.createReadStream(`${frSTPath}.srt`)
                    .pipe(srt2vtt())
                    .pipe(fs.createWriteStream(`${frSTPath}.vtt`));
                    fs.unlinkSync(`${frSTPath}.srt`);
                });
            }
        }).catch(err => {
            getSerieSubs(movie);
        });
    }
};

export { getMovieSubs, getSerieSubs };
