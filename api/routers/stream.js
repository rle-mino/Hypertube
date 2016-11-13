export default (app) => {
	app.get('/api/stream', (req, res) => {
		res.send('STREAM ROUTER: OK');
	});
};