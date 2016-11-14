import * as functions from '../movie/functions';
import * as scrap from '../movie/scrap';

export default (app) => {
	app.get('/api/movie', (req, res) => {
		res.send('MOVIE ROUTER: OK');
	});
	app.get('/api/movie/search', functions.search);
	app.get('/api/movie/scrap/yts', scrap.yts);
	app.get('/api/movie/scrap/tpb', scrap.tpb);
};
