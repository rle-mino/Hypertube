// import MovieFile	from './movieFile'
import torrentStream from 'torrent-stream';
import fs from 'fs';
import * as movie from '../movie/info';

// AJOUT PATH BDD

const streamRoute = async (req, res) => {
	const movieData = await movie.returnData(req);
	let magnet = null;
	if (req.query.s && req.query.e) {
		magnet = movieData.result.torrents[0].magnet;
	} else {
		movieData.result.torrents.forEach((torrent) => {
			if (torrent.quality === req.query.r) {
				magnet = torrent.magnet;
			}
		});
		if (!magnet) magnet = movieData.result.torrents[0].magnet;
	}
	const engine = torrentStream(magnet, { tmp: './MovieLibrary' });
	engine.on('ready', () => {
		engine.files.forEach((file, i) => {
			const ext = file.name.split('.').pop();
			if (ext === 'mp4' || ext === 'mkv') {
				const path = '/goinfre/hypertube-prod/api/MovieLibrary/torrent-stream/aeadc552a16950b1e1812089f0552a6dd74eb01a/Max Steel (2016) [1080p] [YTS.AG]/Max.Steel.2016.1080p.BluRay.x264-[YTS.AG].mp4';
				const stat =  fs.statSync(path);
				const total = stat.size;
				const stream = engine.files[i].createReadStream();
				res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
				fs.createReadStream(path).pipe(res);
				// stream.on('data', (data) => {
				// 	res.write(data);
				// 	// console.log(data);
				// });
				// stream.on('end', () => {
				// 	console.log('FINISHED DOWNLOADING');
				// 	res.end();
				// });
				stream.on('error', e => {
					console.log(e);
				});
			}
		});
	});
};

export default streamRoute
