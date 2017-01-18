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
	console.log('starting download');
	engine.on('ready', () => {
		engine.files.forEach((file) => {
			const ext = file.name.split('.').pop();
			if (ext === 'mp4' || ext === 'mkv') {
				res.writeHead(200, { 'Content-Length': file.length, 'Content-Type': `video/${ext}` });
				console.log('starting streaming');
				const stream = file.createReadStream().pipe(res);
				// stream.on('data', data => {
				// 	res.write(data);
				// });
				stream.on('error', e => {
					console.log(e);
				});
			}
		});
	});
	engine.on('download', () => {
		engine.files.forEach((file) => {
			const ext = file.name.split('.').pop();
			if (ext === 'mp4' || ext === 'mkv') {
				const dl = engine.swarm.downloaded;
				const total = engine.torrent.length;
				const pct = (dl * 100) / total;
				process.stdout.clearLine();
				process.stdout.cursorTo(0);
				process.stdout.write(`${engine.torrent.name} -> dl: ${dl}, total: ${total}, pct: ${Math.floor(pct)}%`);
				if (dl === total) console.log('finished downloading');
			}
		});
	});
};

export default streamRoute
