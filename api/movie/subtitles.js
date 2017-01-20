import OS from 'opensubtitles-api';
import fs from 'fs';
import request from 'request';
import srt2vtt from 'srt-to-vtt';

const absPath = 'public/subtitles/';

const getSubtitle = async (req, res) => {
  const OpenSubtitles = new OS({
    useragent: '42hypertube',
  });
  const season = req.body.season;
  const episode = req.body.episode;
  const code = req.body.code;
  let STPath = `${absPath}${code}.${req.body.lg}`;
  let reqOBJ = { imdbid: code };
  if (season && episode) {
    STPath = `${absPath}${code}S${season}E${episode}.${req.body.lg}`;
    reqOBJ = {
      imdbid: code,
      season,
      episode,
    };
  }
  if (fs.existsSync(`${STPath}.vtt`)) {
    return (res.send({ status: 'success' }));
  }
  OpenSubtitles.search(reqOBJ).then((subtitles) => {
    const lang = req.body.lg === 'fr' ? subtitles.fr : subtitles.en;
    if (lang) {
        const download = request(subtitles.en.url).pipe(fs.createWriteStream(`${STPath}.srt`));
        download.on('finish', () => {
          const file = fs.createReadStream(`${STPath}.srt`)
          .pipe(srt2vtt())
          .pipe(fs.createWriteStream(`${STPath}.vtt`));
          file.on('close', () => {
            res.send({ status: 'success' });
          });
        });
        download.on('error', () => {
          res.send({ status: 'error', details: 'subtitles' });
        });
    } else {
      res.send({ status: 'error', details: 'subtitles' });
    }
  }).catch((err) => {
    res.send({ status: 'error', details: 'subtitles' });
  });
};

export { getSubtitle };
