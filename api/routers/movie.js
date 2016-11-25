import cron from 'cron';
import * as search from '../movie/search';
import * as scrap from '../movie/scrap';
import * as info from '../movie/info';

export default (app) => {
	app.get('/api/movie', (req, res) => {
		res.send('MOVIE ROUTER: OK');
	});
	// app.post('/api/movie/moreinfo', functions.getFilmInfo);
	app.get('/api/movie/fast_search', search.fastSearch);
	app.get('/api/movie/top_search', search.topSearch);
	app.get('/api/movie/search', search.search);

	app.get('/api/movie/refreshyts', scrap.yts);
	app.get('/api/movie/refresheztv', scrap.eztv);

	app.get('/api/movie/:id', info.getData);

	// scrap.yts(); //	UNCOMMENT THIS WHEN PROJECT IS FINISHED -- commented for compliance issues

	const CronJob = cron.CronJob;
	const job = new CronJob('0 0 * * * *', () => {
		console.log('Refreshing database');
		scrap.yts();
		scrap.eztv();
	}, true, 'Europe/Paris');
	job.start();
};
