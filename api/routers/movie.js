export default (app) => {
	app.get('/api/movie', (req, res) => {
		res.send('MOVIE ROUTER: OK');
	});
};