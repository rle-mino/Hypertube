// import MovieFile	from './movieFile'
import fs from 'fs';
import torrentStream from 'torrent-stream';
import Transcoder from 'stream-transcoder';
import * as movie from '../movie/info';
import { addPath, checkPath } from '../movie/scrap';

// AJOUT PATH BDD

const getTorrent = async (req) => {
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
	return magnet;
};

const torrentHandle = (req, res, magnet) => {
	const engine = torrentStream(magnet, { tmp: './MovieLibrary' });
	engine.on('ready', () => {
		engine.files.forEach(async (file) => {
			const ext = file.name.split('.').pop();
			if (ext === 'mp4' || ext === 'mkv' || ext === 'avi') {
				console.log(`starting download for ${file.name}`);
				res.writeHead(200, { 'Content-Length': file.length, 'Content-Type': `video/${ext}` });
				const stream = file.createReadStream();
				if (ext !== 'mp4' && ext !== 'mkv') {
					new Transcoder(stream).videoCodec('h264')
					.audioCodec('aac')
					.format('mp4').stream().pipe(res);
					// .pipe(res);
					// stream.pipe(res);
				} else {
					stream.pipe(res);
				}
				console.log(`starting streaming for ${file.name}`);
				// stream.on('error', e => {
				// 	console.log(e);
				// });
			}
		});
	});
	engine.on('download', () => {
		engine.files.forEach((file, i) => {
			const ext = file.name.split('.').pop();
			if (ext === 'mp4' || ext === 'mkv' || ext === 'avi') {
				const path = `${engine.path}/${engine.torrent.files[i].path}`;
				const dl = engine.swarm.downloaded;
				const total = engine.torrent.files[i].length;
				const pct = (dl * 100) / total;
				process.stdout.clearLine();
				process.stdout.cursorTo(0);
				process.stdout.write(`${engine.torrent.name} -> dl: ${dl}, total: ${total}, pct: ${Math.ceil(pct)}%`);
				if (dl >= total) {
					addPath(req, path);
				}
			}
		});
	});
};

const streamRoute = async (req, res) => {
	const magnet = await getTorrent(req);
	const path = await checkPath(req);
	if (path) {
		addPath(req, path);
		const ext = path.split('.').pop();
		const stat = fs.statSync(path);
		const total = stat.size;
		const stream = fs.createReadStream(path);
		res.writeHead(200, { 'Content-Length': total, 'Content-Type': `video/${ext}` });
		console.log(`file already in DB, now streaming ${path.split('/').pop()}`);
		if (ext !== 'mp4' && ext !== 'mkv') {
			new Transcoder(stream).videoCodec('h264')
			.audioCodec('aac')
			.format('mp4').stream().pipe(res);
		} else {
			stream.pipe(res);
		}
		// const file =
		// return;
	} else {
		torrentHandle(req, res, magnet);
	}
};

export default streamRoute;
