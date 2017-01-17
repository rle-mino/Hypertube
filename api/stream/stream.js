// import MovieFile	from './movieFile'
import torrentStream from 'torrent-stream';
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
				const stream = engine.files[i].createReadStream();
				stream.on('data', (data) => {
					res.write(data);
					// console.log(data);
				});
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
