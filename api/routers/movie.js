import cron from 'cron';
import * as functions from '../movie/functions';
import * as scrap from '../movie/scrap';

export default (app) => {
	app.get('/api/movie', (req, res) => {
		res.send('MOVIE ROUTER: OK');
	});
	app.post('/api/movie/moreinfo', functions.getFilmInfo);
	app.get('/api/movie/fast_search', functions.fastSearch);
	app.get('/api/movie/top_search', functions.topSearch);
	app.get('/api/movie/search', functions.search);
	app.get('/api/movie/refreshdb', scrap.yts);

	// scrap.yts(); //	UNCOMMENT THIS WHEN PROJECT IS FINISHED -- commented for compliance issues

	const CronJob = cron.CronJob;
	const job = new CronJob('0 0 * * * *', () => {
		console.log('Refreshing database');
		scrap.yts();
	}, true, 'Europe/Paris');
	job.start();
};
