import cron from 'cron';
import * as functions from '../movie/functions';
import * as scrap from '../movie/scrap';

export default (app) => {
	app.get('/api/movie', (req, res) => {
		res.send('MOVIE ROUTER: OK');
	});
	app.post('/api/movie/moreinfo', functions.getFilmInfo);
	app.get('/api/movie/search', functions.search);

	const CronJob = cron.CronJob;
	const job = new CronJob('00 30 11 * * 1-7', () => {
		console.log('Refreshing database');
		scrap.yts();
	}, null, true, 'Europe/Paris');
	job.start();
};
